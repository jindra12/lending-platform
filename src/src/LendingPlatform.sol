// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import {IERC20Metadata} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReverseRegistrar} from "../lib/ens-contracts/contracts/reverseRegistrar/ReverseRegistrar.sol";
import {ENS} from "../lib/ens-contracts/contracts/registry/ENS.sol";

contract LendingPlatFormStructs {
    struct Collateral {
        uint256 value;
        bool isCollateralEth;
        IERC20Metadata collateralCoin;
    }
    struct LoanData {
        uint256 amount;
        uint256 toBePaid;
        uint256 interval;
        uint256 singlePayment;
        uint256 defaultLimit;
        Collateral collateral;
    }
    struct LoanOffer {
        IERC20Metadata coin;
        LoanData loanData;
        address from;
        uint256 id;
        bool isEth;
    }
    struct LoanOfferSearch {
        address from;
        bool includeEth;
        IERC20Metadata[] coins;
        uint256[] amount;
        uint256[] toBePaid;
        uint256[] interval;
        uint256[] singlePayment;
        uint256[] defaultLimit;
        uint256[] collateral;
        bool includeCollateralEth;
        IERC20Metadata[] collateralCoins;
    }
    struct ActiveRequest {
        uint256 uniqueId;
        address borrower;
    }
}

contract LendingPlatformEvents {
    event IssuedLoan(uint256 indexed loanId, address indexed from);
    event AcceptedLoan(uint256 indexed loanId, address indexed from, address indexed to, address loan);
    event RequestLoanLimit(address indexed borrower, uint256 indexed uniqueId);
    event SetLoanLimit(address indexed borrower, uint256 indexed requestIndex);
    event SetLoanFee(uint256 indexed amount);
    event IncreaseCoinLoanLimit(uint256 indexed amount, address indexed borrower, string indexed coinSymbol);
    event IncreaseEthLoanLimit(uint256 indexed amount, address indexed borrower);
}

contract LendingPlatform is Ownable,LendingPlatFormStructs,LendingPlatformEvents {
    mapping(address => address) internal _loansByBorrowers;
    mapping(address => mapping(address => uint256)) internal _loanCoinLimit;
    mapping(address => uint256) internal _loanEthLimit;
    mapping(address => bytes) internal _loanLimitRequestLinks;
    
    ActiveRequest[] internal _activeRequestIds;

    uint256 internal _loanLimitFee;

    LoanOffer[] internal _loanOffers;

    uint256 internal _loanOfferId = 1;
    uint256 internal _requestUniqueIndex = 1;

    constructor(ENS ens, string memory name, bytes32 addressReverseNode) {
        if (address(ens) != address(0)) {
            ReverseRegistrar reverseRegistrar = ReverseRegistrar(ens.owner(addressReverseNode));
            reverseRegistrar.claim(address(this));
            reverseRegistrar.setName(name);
        }
    }

    function _loanCheck(uint256 amount, uint256 toBePaid, uint256 singlePayment) internal pure {
        require(amount < toBePaid, "Invalid amount");
        require(singlePayment < toBePaid, "Invalid single payment");
        require(toBePaid % singlePayment == 0, "Single payment non divisible by toBePaid");
    }

    function _fillLoanDetails(uint256 amount, uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, Collateral memory collateral) internal pure returns(LoanData memory) {
        LoanData memory loanData;
        loanData.amount = amount;
        loanData.toBePaid = toBePaid;
        loanData.interval = interval;
        loanData.collateral = collateral;
        loanData.singlePayment = singlePayment;
        loanData.defaultLimit = defaultLimit;
        return loanData;
    }

    function _transferCoinToContract(IERC20Metadata coin, uint256 amount) internal {
        require(coin.allowance(msg.sender, address(this)) >= amount, "Not enough allowance to transfer to contract");
        bool okTransfer = coin.transferFrom(msg.sender, address(this), amount);
        require(okTransfer, "Could not transfer loaned money to contract");
    }

    function _finishLoanOffer(LoanOffer memory loanOffer) internal {
        loanOffer.from = msg.sender;
        loanOffer.id = _loanOfferId;
        _loanOfferId++;
        _loanOffers.push(loanOffer);
        emit IssuedLoan(loanOffer.id, loanOffer.from);
    }

    function _findIdInActiveRequests(uint256 id) internal view returns(bool, uint256) {
        for (uint256 i = 0; i < _activeRequestIds.length; i++) {
            if (id == _activeRequestIds[i].uniqueId) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function _removeIdFromActiveRequests(uint256 id) internal {
        (bool found, uint256 index) = _findIdInActiveRequests(id);
        require(found, "Request ID not found");
        if (index == _activeRequestIds.length - 1) {
            _activeRequestIds.pop();
        } else {
            ActiveRequest memory lastActiveId = _activeRequestIds[index];
            _activeRequestIds[index] = lastActiveId;
            _activeRequestIds.pop();
        }
    }

    function _findLoanOfferIndex(uint256 id) internal view returns(bool,uint256) {
        for (uint256 i = 0; i < _loanOffers.length; i++) {
            if (id == _loanOffers[i].id) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function _removeLoanByIndex(uint256 getFromIndex) internal {
        if (getFromIndex == _loanOffers.length - 1) {
            _loanOffers.pop();
        } else {
            LoanOffer memory lastLoan = _loanOffers[_loanOffers.length - 1];
            _loanOffers[getFromIndex] = lastLoan;
            _loanOffers.pop();
        }
    }

    function getOwner() public view returns(address) {
        return owner();
    }

    function getLoanLimitRequest(address borrower) public view returns(bytes memory) {
        return _loanLimitRequestLinks[borrower];
    }

    function setLoanLimitRequest(bytes calldata info) public payable {
        require(msg.value == _loanLimitFee, "Message does not contain enough eth to pay for fee");
        _loanLimitRequestLinks[msg.sender] = info;
        ActiveRequest memory activeRequest;
        activeRequest.uniqueId = _requestUniqueIndex;
        activeRequest.borrower = msg.sender;
        _activeRequestIds.push(activeRequest);
        emit RequestLoanLimit(msg.sender, _requestUniqueIndex);
        _requestUniqueIndex++;
    }

    function offerLoanEthEth(uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral) public payable {
        _loanCheck(msg.value, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.isCollateralEth = true;
        loanOffer.loanData = _fillLoanDetails(msg.value, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.isEth = true;
        _finishLoanOffer(loanOffer);
    }

    function offerLoanEthCoin(uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral, IERC20Metadata collateralCoin) public payable {
        _loanCheck(msg.value, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.collateralCoin = collateralCoin;
        loanOffer.loanData = _fillLoanDetails(msg.value, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.isEth = true;
        _finishLoanOffer(loanOffer);
    }

    function offerLoanCoinEth(uint256 amount, uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral, IERC20Metadata coin) public {
        _loanCheck(amount, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.isCollateralEth = true;
        loanOffer.loanData = _fillLoanDetails(amount, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.coin = coin;
        _transferCoinToContract(coin, amount);
        _finishLoanOffer(loanOffer);
    }

    function offerLoanCoinCoin(uint256 amount, uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral, IERC20Metadata coin, IERC20Metadata collateralCoin) public {
        _loanCheck(amount, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.collateralCoin = collateralCoin;
        loanOffer.loanData = _fillLoanDetails(amount, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.coin = coin;
        _transferCoinToContract(coin, amount);
        _finishLoanOffer(loanOffer);
    }

    function getLoanOffersLength() public view returns(uint256) {
        return _loanOffers.length;
    }

    function _coinMatch(IERC20Metadata[] memory coins, IERC20Metadata coin) internal pure returns(bool) {
        for (uint256 i = 0; i < coins.length; i++) {
            if (coin == coins[i]) {
                return true;
            }
        }
        return false;
    }

    function _compareInterval(uint256[] memory interval, uint256 value) internal pure returns(bool) {
        if (interval.length != 2) {
            return true;
        }
        return interval[0] >= value && interval[1] <= value;
    }

    function _loanOfferMatchesSearch(LoanOffer memory loanOffer, LoanOfferSearch memory search) internal pure returns(bool) {
        if (search.from != address(0) && loanOffer.from != search.from) {
            return false;
        }

        if (!search.includeEth && loanOffer.isEth) {
            return false;
        }

        if (search.coins.length > 0 && !loanOffer.isEth && !_coinMatch(search.coins, loanOffer.coin)) {
            return false;
        }

        if (!_compareInterval(search.amount, loanOffer.loanData.amount)) {
            return false;
        }

        if (!_compareInterval(search.toBePaid, loanOffer.loanData.toBePaid)) {
            return false;
        }

        if (!_compareInterval(search.interval, loanOffer.loanData.interval)) {
            return false;
        }

        if (!_compareInterval(search.singlePayment, loanOffer.loanData.singlePayment)) {
            return false;
        }

        if (!_compareInterval(search.defaultLimit, loanOffer.loanData.defaultLimit)) {
            return false;
        }

        if (!_compareInterval(search.collateral, loanOffer.loanData.collateral.value)) {
            return false;
        }
        
        if (!search.includeCollateralEth && loanOffer.loanData.collateral.isCollateralEth) {
            return false;
        }

        if (search.collateralCoins.length > 0 && !loanOffer.loanData.collateral.isCollateralEth && !_coinMatch(search.collateralCoins, loanOffer.loanData.collateral.collateralCoin)) {
            return false;
        }

        return true;
    }

    function listActiveRequests(uint256 from, uint256 count) public view returns(ActiveRequest[] memory) {
        ActiveRequest[] memory acc = new ActiveRequest[](count);
        for (uint256 i = 0; i < count; i++) {
            if (from + i >= _activeRequestIds.length) {
                break;
            }
            acc[i] = _activeRequestIds[from + i];
        }
        return acc;        
    }

    function listLoanOffersBy(uint256 from, uint256 count, LoanOfferSearch calldata search) public view returns(LoanOffer[] memory) {
        LoanOffer[] memory acc = new LoanOffer[](count);
        uint256 i = 0;
        uint256 j = 0;
        while (i < _loanOffers.length && j < count) {
            if (_loanOfferMatchesSearch(_loanOffers[from + i], search)) {
                acc[j] = _loanOffers[from + i];
                j++;
            }
            i++;
        }
        return acc;
    }

    function listLoanOffers(uint256 from, uint256 count) public view returns(LoanOffer[] memory) {
        LoanOffer[] memory acc = new LoanOffer[](count);
        for (uint256 i = 0; i < count; i++) {
            if (from + i >= _loanOffers.length) {
                break;
            }
            acc[i] = _loanOffers[from + i];
        }
        return acc;
    }

    function getLoanFee() public view returns(uint256) {
        return _loanLimitFee;
    }

    function setLoanFee(uint256 amount) onlyOwner public {
        _loanLimitFee = amount;
        emit SetLoanFee(amount);
    }

    function getLoanLimit(address to) public view returns (uint256) {
        return _loanEthLimit[to];
    }

    function setLoanLimit(address to, uint256 amount, uint256 requestId) onlyOwner public {
        _loanEthLimit[to] = amount;
        _removeIdFromActiveRequests(requestId);
        emit IncreaseEthLoanLimit(amount, to);
    }

    function getLoanLimit(address to, IERC20Metadata coin) public view returns (uint256) {
        return _loanCoinLimit[address(coin)][to];
    }

    function setLoanLimit(address to, uint256 amount, IERC20Metadata coin, uint256 requestId) onlyOwner public {
        _loanCoinLimit[address(coin)][to] = amount;
        _removeIdFromActiveRequests(requestId);
        emit IncreaseCoinLoanLimit(amount, to, coin.symbol());
    }

    function removeLoan(uint256 id) public {
        (bool found, uint256 getFromIndex) = _findLoanOfferIndex(id);
        require(found, "Loan already taken");
        LoanOffer memory loanOfferAt = _loanOffers[getFromIndex];
        require(msg.sender == loanOfferAt.from, "Loan offer can only be removed by loan issuer");
        if (loanOfferAt.isEth) {
            (bool ok,) = loanOfferAt.from.call{ value: loanOfferAt.loanData.amount }("");
            require(ok, "Could not transfer loan amount back to lender");
        } else {
            bool ok = loanOfferAt.coin.transfer(loanOfferAt.from, loanOfferAt.loanData.amount);
            require(ok, "Could not transfer loan amount back to lender");
        }
        _removeLoanByIndex(getFromIndex);
    }

    function acceptLoan(uint256 id) public payable returns(Loan) {
        (bool found, uint256 getFromIndex) = _findLoanOfferIndex(id);
        require(found, "Loan already taken, try again");
        LoanOffer memory loanOfferAt = _loanOffers[getFromIndex];
        if (loanOfferAt.isEth) {
            require(_loanEthLimit[msg.sender] >= loanOfferAt.loanData.amount, "Loan limit exceeded");
        } else {
            require(_loanCoinLimit[address(loanOfferAt.coin)][msg.sender] >= loanOfferAt.loanData.amount, "Loan limit exceeded");
        }

        _removeLoanByIndex(getFromIndex);

        Loan loan = new Loan(
            loanOfferAt.from,
            msg.sender,
            loanOfferAt.loanData.toBePaid,
            loanOfferAt.loanData.singlePayment,
            loanOfferAt.loanData.interval,
            loanOfferAt.loanData.defaultLimit,
            block.timestamp
        );

        if (loanOfferAt.loanData.collateral.isCollateralEth) {
            require(msg.value == loanOfferAt.loanData.collateral.value, "Message did not contain enough eth for collateral");
            loan.setEthCollateral{ value: loanOfferAt.loanData.collateral.value }();
        } else {
            require(loanOfferAt.loanData.collateral.collateralCoin.allowance(msg.sender, address(this)) >= loanOfferAt.loanData.collateral.value, "Not enough allowance for collateral");
            bool okcollateral = loanOfferAt.loanData.collateral.collateralCoin.transferFrom(msg.sender, address(this), loanOfferAt.loanData.collateral.value);
            require(okcollateral, "Collateral transfer to lending platform failed");
            bool okloancollateral = loanOfferAt.loanData.collateral.collateralCoin.transfer(address(loan), loanOfferAt.loanData.collateral.value);
            require(okloancollateral, "Collateral transfer to loan failed");
            loan.setCoinCollateral(loanOfferAt.loanData.collateral.collateralCoin, loanOfferAt.loanData.collateral.value);
        }

        if (loanOfferAt.isEth) {
            loan.setIsEth();
            (bool ok,) = msg.sender.call{ value: loanOfferAt.loanData.amount }("");
            require(ok, "Loan failed");
            _loanEthLimit[msg.sender] -= loanOfferAt.loanData.amount;
        } else {
            loan.setCoin(loanOfferAt.coin);
            bool okLoanToBorrower = loanOfferAt.coin.transfer(msg.sender, loanOfferAt.loanData.amount);
            require(okLoanToBorrower, "Loan transfer to borrower failed");
            _loanCoinLimit[address(loanOfferAt.coin)][msg.sender] -= loanOfferAt.loanData.amount;
        }
        loan.finalize();
        emit AcceptedLoan(loanOfferAt.id, loanOfferAt.from, msg.sender, address(loan));
        return loan;
    }
}

contract Loan {
    address internal _lender;
    address internal _borrower;
    uint256 internal _remaining;
    uint256 internal _singlePayment;
    uint256 internal _interval;
    uint256 internal _defaultLimit;
    uint256 internal _lastPayment;
    uint256 internal _collateral;
    bool internal _isCollateralEth;
    IERC20Metadata internal _collateralCoin;

    IERC20Metadata internal _coin;
    bool internal _isEth;
    bool internal _inDefault;
    bool internal _paidEarly;
    bool internal _requestPaidEarly;
    uint256 internal _requestPaidEarlyAmount;

    bool internal _finalize;

    event DidPayment(uint256 indexed timestamp, uint256 indexed amount, uint256 indexed remaining);
    event RequestEarlyRepayment(uint256 amount);
    event RejectEarlyRepayment();
    event AcceptEarlyRepayment(uint256 amount);
    event DefaultOnLoan(uint256 indexed timestamp, uint256 collateral);
    event FullyPaid();

    struct LoanDetails {
        address lender;
        address borrower;
        uint256 remaining;
        uint256 singlePayment;
        uint256 interval;
        uint256 defaultLimit;
        uint256 lastPayment;
        uint256 collateral;
        bool isCollateralEth;
        IERC20Metadata collateralCoin;

        IERC20Metadata coin;
        bool isEth;
        bool inDefault;
        bool  paidEarly;
        bool requestPaidEarly;
        uint256 requestPaidEarlyAmount;
    }

    constructor(address lender, address borrower, uint256 remaining, uint256 singlePayment, uint256 interval, uint256 defaultLimit, uint256 lastPayment) {
        _lender = lender;
        _borrower = borrower;
        _remaining = remaining;
        _singlePayment = singlePayment;
        _interval = interval;
        _defaultLimit = defaultLimit;
        _lastPayment = lastPayment;
    }

    function getLoanDetails() public view returns(LoanDetails memory) {
        LoanDetails memory detail;
        detail.borrower = _borrower;
        if (!_isEth) {
            detail.coin = _coin;
        }
        detail.collateral = _collateral;
        if (!_isCollateralEth) {
            detail.collateralCoin = _collateralCoin;
        }
        detail.defaultLimit = _defaultLimit;
        detail.inDefault = _inDefault;
        detail.interval = _interval;
        detail.isCollateralEth = _isCollateralEth;
        detail.isEth = _isEth;
        detail.lastPayment = _lastPayment;
        detail.lender = _lender;
        detail.paidEarly = _paidEarly;
        detail.remaining = _remaining;
        detail.requestPaidEarly = _requestPaidEarly;
        if (_requestPaidEarly) {
            detail.requestPaidEarlyAmount = _requestPaidEarlyAmount;
        }
        detail.singlePayment = _singlePayment;
        return detail;
    }

    function getLender() public view returns(address) {
        return _lender;
    }

    function getBorrower() public view returns(address) {
        return _borrower;
    }

    function getRemaining() public view returns(uint256) {
        return _remaining;
    }

    function getSinglePayment() public view returns(uint256) {
        return _singlePayment;
    }

    function getInterval() public view returns(uint256) {
        return _interval;
    }

    function getDefaultLimit() public view returns(uint256) {
        return _defaultLimit;
    }

    function getLastPayment() public view returns(uint256) {
        return _lastPayment;
    }

    function getCollateral() public view returns(uint256) {
        return _collateral;
    }

    function getCollateralCoin() public view returns(IERC20Metadata) {
        require(!_isCollateralEth, "Collateral was set in eth, not ERC20");
        return _collateralCoin;
    }

    function getCollateralEth() public view returns(bool) {
        return _isCollateralEth;
    }

    function getCoin() public view returns(IERC20Metadata) {
        require(!_isEth, "Loan was done in eth, not ERC20");
        return _coin;
    }

    function getIsEth() public view returns(bool) {
        return _isEth;
    }

    function getIsDefault() public view returns(bool) {
        return _inDefault;
    }

    function getPaidEarly() public view returns(bool) {
        return _paidEarly;
    }

    function getRequestPaidEarly() public view returns(bool) {
        return _requestPaidEarly;
    }

    function getRequestPaidEarlyAmount() public view returns(uint256) {
        require(_requestPaidEarly, "There is no request for early repayment");
        return _requestPaidEarlyAmount;
    }

    function finalize() public {
        require(!_finalize, "Cannot modify after acceptance");
        _finalize = true;
    }

    function setEthCollateral() public payable {
        require(!_finalize, "Cannot modify after acceptance");
        _isCollateralEth = true;
        _collateral = msg.value;
    }

    function setCoinCollateral(IERC20Metadata coin, uint256 value) public {
        require(!_finalize, "Cannot modify after acceptance");
        _collateralCoin = coin;
        _collateral = value;
    }

    function setIsEth() public {
        require(!_finalize, "Cannot modify after acceptance");
        _isEth = true;
    }

    function setCoin(IERC20Metadata coin) public {
        require(!_finalize, "Cannot modify after acceptance");
        _coin = coin;
    }

    function canDoPayment() public view returns(bool) {
        return block.timestamp >= _lastPayment + _interval && !_inDefault && !_paidEarly && _remaining >= _singlePayment;
    }

    function doPayment() public payable {
        require(block.timestamp >= _lastPayment + _interval, "Not yet time to pay your loan");
        require(!_inDefault, "Loan has been defaulted on");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining >= _singlePayment, "Loan has been paid on time");
        require(msg.sender == _borrower, "Only borrower can repay a loan");
        
        if (_isEth) {
            require(msg.value == _singlePayment, "Incorrect value of message value, must equal your single payment");
            (bool ok,) = _lender.call{ value: _singlePayment }("");
            require(ok, "Payment couldn't be processed");
        } else {
            require(_coin.allowance(msg.sender, address(this)) >= _singlePayment, "There is not enough allowance to settle your payment");
            bool okToContract = _coin.transferFrom(msg.sender, address(this), _singlePayment);
            require(okToContract, "Payment to contract couldn't be processed");
            bool okToLender = _coin.transfer(_lender, _singlePayment);
            require(okToLender, "Payment to lender couldn't be processed");
        }

        _lastPayment = block.timestamp;
        _remaining -= _singlePayment;

        emit DidPayment(block.timestamp, _singlePayment, _remaining);

        if (_remaining == 0) {
            if (_isCollateralEth) {
                (bool ok,) = msg.sender.call{ value: _collateral }("");
                require(ok, "Collateral return failed");
            } else {
                bool ok = _collateralCoin.transfer(msg.sender, _collateral);
                require(ok, "Collateral return failed");
            }
            emit FullyPaid();
        }
    }

    function canRequestEarlyRepayment() public view returns(bool) {
        return !_inDefault && !_paidEarly && _remaining != 0 && !_requestPaidEarly;
    }

    function _checkRequestEarlyRepayment() internal view {
        require(!_inDefault, "Loan has defaulted already");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining != 0, "Loan has been paid for");
        require(msg.sender == _borrower, "Incorrect sender in request");
        require(!_requestPaidEarly, "Already requested early repayment");
    }

    function requestEarlyRepaymentEth() public payable {
        _checkRequestEarlyRepayment();
        require(_isEth, "Repayment must be in loan currency");
        _requestPaidEarlyAmount = msg.value;
        _requestPaidEarly = true;
        emit RequestEarlyRepayment(msg.value);
    }

    function requestEarlyRepaymentCoin(uint256 amount) public {
        _checkRequestEarlyRepayment();
        require(!_isEth, "Repayment must be in loan currency");
        _requestPaidEarlyAmount = amount;
        _requestPaidEarly = true;
        require(_coin.allowance(_borrower, address(this)) >= amount, "Not enough in allowance for early repayment");
        bool ok = _coin.transferFrom(_borrower, address(this), amount);
        require(ok, "Early repayment transfer failed");
        emit RequestEarlyRepayment(amount);
    }

    function canDoEarlyRepayment() public view returns(bool) {
        return !_inDefault && !_paidEarly && _remaining != 0 && _requestPaidEarly;
    }

    function _earlyRepaymentDecisionCheck() internal view {
        require(!_inDefault, "Loan has defaulted already");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining != 0, "Loan has been paid for");
        require(_requestPaidEarly, "Early repayment not requested");
    }

    function rejectEarlyRepayment() public {
        _earlyRepaymentDecisionCheck();
        require(msg.sender == _lender || msg.sender == _borrower, "Incorrect sender in request");
        if (_isEth) {
            (bool okReturn,) = _borrower.call{ value: _requestPaidEarlyAmount }("");
            require(okReturn, "Could not return requested early repayment");
        } else {
            bool okReturn = _coin.transfer(_borrower, _requestPaidEarlyAmount);
            require(okReturn, "Could not return requested early repayment");
        }
        _requestPaidEarly = false;
        _requestPaidEarlyAmount = 0;
        emit RejectEarlyRepayment();
    }

    function acceptEarlyRepayment() public {
        _earlyRepaymentDecisionCheck();
        require(msg.sender == _lender, "Incorrect sender in request");
        _paidEarly = true;
        if (_isEth) {
            (bool ok,) = _lender.call{ value: _requestPaidEarlyAmount }("");
            require(ok, "Early repayment transaction failed");
        } else {
            bool ok = _coin.transfer(_lender, _requestPaidEarlyAmount);
            require(ok, "Early repayment transaction failed");
        }
        if (_isCollateralEth) {
            (bool ok,) = _borrower.call{ value: _collateral }("");
            require(ok, "Early repayment collateral return failed");
        } else {
            bool ok = _collateralCoin.transfer(_borrower, _collateral);
            require(ok, "Early repayment collateral return failed");
        }
        emit AcceptEarlyRepayment(_requestPaidEarlyAmount);
    }

    function canDefaultOnLoan() public view returns(bool) {
        return block.timestamp >= _lastPayment + _defaultLimit && !_inDefault && _remaining > 0;
    }

    function defaultOnLoan() public {
        require(block.timestamp >= _lastPayment + _defaultLimit, "Borrower has not yet reached default time");
        require(msg.sender == _lender, "Only lender can trigger default");
        require(!_inDefault, "Loan already in default");
        require(_remaining > 0, "Loan paid off fully");
        _inDefault = true;
        if (_isCollateralEth) {
            (bool ok,) = msg.sender.call{ value: _collateral }("");
            require(ok, "Collateral payment failed");
        } else {
            bool ok = _collateralCoin.transfer(_lender, _collateral);
            require(ok, "Collateral payment failed");
        }
        if (_requestPaidEarly) {
            if (_isEth) {
                (bool okReturnEarly,) = _borrower.call{ value: _requestPaidEarlyAmount }("");
                require(okReturnEarly, "Could not return early repayment request");
            } else {
                bool okReturnEarly = _coin.transfer(_borrower, _requestPaidEarlyAmount);
                require(okReturnEarly, "Could not return early repayment request");
            }
            _requestPaidEarly = false;
            _requestPaidEarlyAmount = 0;
        }
        emit DefaultOnLoan(block.timestamp, _collateral);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {IERC20Metadata} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

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
    struct LoanProgress {
        LoanOffer loanOffer;
        uint256 lastPayment;
    }
}

contract LendingPlatformEvents {
    event IssuedLoan(uint256 indexed loanId);
    event AcceptedLoan(address indexed loan);
    event RequestLoanLimit(address indexed borrower);
    event SetLoanFee(uint256 indexed amount);
    event IncreaseCoinLoanLimit(uint256 indexed amount, address indexed borrower, string indexed coinSymbol);
    event IncreaseEthLoanLimit(uint256 indexed amount, address indexed borrower);
}

contract LendingPlatform is Ownable,LendingPlatFormStructs,LendingPlatformEvents {
    mapping(address => mapping(address => LoanProgress)) internal _loansByLenders;
    mapping(address => address) internal _loansByBorrowers;
    mapping(address => mapping(address => uint256)) internal _loanCoinLimit;
    mapping(address => uint256) internal _loanEthLimit;
    mapping(address => bytes) internal _loanLimitRequestLinks;
    
    uint256 internal _loanLimitFee;

    LoanOffer[] internal _loanOffers;

    uint256 internal _loanOfferId = 1;

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

    function _finishLoanOffer(LoanOffer memory loanOffer) internal {
        loanOffer.from = msg.sender;
        loanOffer.id = _loanOfferId;
        _loanOfferId++;
        _loanOffers.push(loanOffer);
        emit IssuedLoan(loanOffer.id);
    }

    function getLoanLimitRequest(address borrower) public view returns(bytes memory) {
        return _loanLimitRequestLinks[borrower];
    }

    function setLoanLimitRequest(bytes calldata info) public payable {
        require(msg.value == _loanLimitFee, "Message does not contain enough eth to pay for fee");
        _loanLimitRequestLinks[msg.sender] = info;
        emit RequestLoanLimit(msg.sender);
    }

    function offerLoan(uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral, IERC20Metadata collateralCoin) public payable {
        _loanCheck(msg.value, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.collateralCoin = collateralCoin;
        loanOffer.loanData = _fillLoanDetails(msg.value, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.isEth = true;
        _finishLoanOffer(loanOffer);
    }

    function offerLoan(uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral) public payable {
        _loanCheck(msg.value, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.isCollateralEth = true;
        loanOffer.loanData = _fillLoanDetails(msg.value, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.isEth = true;
        _finishLoanOffer(loanOffer);
    }

    function offerLoan(uint256 amount, uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral, IERC20Metadata coin) public {
        _loanCheck(amount, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.isCollateralEth = true;
        loanOffer.loanData = _fillLoanDetails(amount, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.coin = coin;
        _finishLoanOffer(loanOffer);
    }

    function offerLoan(uint256 amount, uint256 toBePaid, uint256 interval, uint256 defaultLimit, uint256 singlePayment, uint256 collateral, IERC20Metadata coin, IERC20Metadata collateralCoin) public {
        _loanCheck(amount, toBePaid, singlePayment);
        LoanOffer memory loanOffer;
        Collateral memory collateralStore;
        collateralStore.value = collateral;
        collateralStore.collateralCoin = collateralCoin;
        loanOffer.loanData = _fillLoanDetails(amount, toBePaid, interval, defaultLimit, singlePayment, collateralStore);
        loanOffer.coin = coin;
        _finishLoanOffer(loanOffer);
    }

    function getLoanOffersLength() public view returns(uint256) {
        return _loanOffers.length;
    }

    function listLoanOffers(uint256 from, uint256 to) public view returns(LoanOffer[] memory) {
        LoanOffer[] memory acc = new LoanOffer[](to - from);
        for (uint256 i = from; i < to; i++) {
            acc[i] = _loanOffers[i];
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

    function setLoanLimit(address to, uint256 amount) onlyOwner public {
        _loanEthLimit[to] = amount;
        emit IncreaseEthLoanLimit(amount, to);
    }

    function getLoanLimit(address to, IERC20Metadata coin) public view returns (uint256) {
        return _loanCoinLimit[address(coin)][to];
    }

    function setLoanLimit(address to, uint256 amount, IERC20Metadata coin) onlyOwner public {
        _loanCoinLimit[address(coin)][to] = amount;
        emit IncreaseCoinLoanLimit(amount, to, coin.symbol());
    }

    function acceptLoan(address from, uint256 getFromIndex, uint256 id) public payable returns(Loan) {
        LoanOffer memory loanOfferAt = _loanOffers[getFromIndex];
        require(loanOfferAt.id == id, "Loan already taken, try again");
        if (loanOfferAt.isEth) {
            require(_loanEthLimit[msg.sender] > loanOfferAt.loanData.amount, "Loan limit exceeded");
        } else {
            require(_loanCoinLimit[address(loanOfferAt.coin)][msg.sender] > loanOfferAt.loanData.amount, "Loan limit exceeded");
        }

        if (getFromIndex == _loanOffers.length - 1) {
            _loanOffers.pop();
        } else {
            LoanOffer memory lastLoan = _loanOffers[_loanOffers.length - 1];
            _loanOffers[getFromIndex] = lastLoan;
            _loanOffers.pop();
        }

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
            (bool collateralTransfer,) = address(loan).call{ value: loanOfferAt.loanData.collateral.value }("");
            require(collateralTransfer, "Collateral transfer failed");
            loan.setEthCollateral(loanOfferAt.loanData.collateral.value);
        } else {
            require(loanOfferAt.coin.allowance(msg.sender, address(this)) > loanOfferAt.loanData.collateral.value, "Not enough allowance for collateral");
            bool okcollateral = loanOfferAt.coin.transferFrom(msg.sender, address(this), loanOfferAt.loanData.collateral.value);
            require(okcollateral, "Collateral transfer failed");
            loan.setCoinCollateral(loanOfferAt.loanData.collateral.collateralCoin, loanOfferAt.loanData.collateral.value);
        }

        if (loanOfferAt.isEth) {
            loan.setIsEth();
            require(loanOfferAt.loanData.amount < _loanEthLimit[from], "Trying to borrow too much");
            (bool ok,) = msg.sender.call{ value: loanOfferAt.loanData.amount }("");
            require(ok, "Loan failed");
            _loanEthLimit[msg.sender] -= loanOfferAt.loanData.amount;
        } else {
            loan.setCoin(loanOfferAt.coin);
            require(loanOfferAt.coin.allowance(loanOfferAt.from, address(this)) > loanOfferAt.loanData.amount, "Not enough allowance for the loan to go through");
            bool okLoanToContract = loanOfferAt.coin.transferFrom(loanOfferAt.from, address(this), loanOfferAt.loanData.amount);
            require(okLoanToContract, "Loan transfer to contract failed");
            bool okLoanToBorrower = loanOfferAt.coin.transfer(msg.sender, loanOfferAt.loanData.amount);
            require(okLoanToBorrower, "Loan transfer to borrower failed");
            _loanCoinLimit[msg.sender][address(loanOfferAt.coin)] -= loanOfferAt.loanData.amount;
        }
        loan.finalize();
        emit AcceptedLoan(address(loan));
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

    constructor(address lender, address borrower, uint256 remaining, uint256 singlePayment, uint256 interval, uint256 defaultLimit, uint256 lastPayment) {
        _lender = lender;
        _borrower = borrower;
        _remaining = remaining;
        _singlePayment = singlePayment;
        _interval = interval;
        _defaultLimit = defaultLimit;
        _lastPayment = lastPayment;
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
        require(!_isEth, "Collateral was set in eth, not ERC20");
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

    function setEthCollateral(uint256 value) public {
        require(!_finalize, "Cannot modify after acceptance");
        _isCollateralEth = true;
        _collateral = value;
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

    function doPayment() public payable {
        require(_lastPayment + _interval > block.timestamp, "Not yet time to pay your loan");
        require(!_inDefault, "Loan has been defaulted on");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining > _singlePayment, "Loan has been paid on time");
        require(msg.sender == _borrower, "Only borrower can repay a loan");
        
        if (_isEth) {
            require(msg.value == _singlePayment, "Incorrect value of message value, must equal your single payment");
            (bool ok,) = _lender.call{ value: _singlePayment }("");
            require(ok, "Payment couldn't be processed");
        } else {
            require(_coin.allowance(msg.sender, address(this)) > _singlePayment, "There is not enough allowance to settle your payment");
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

    function _checkRequestEarlyRepaiment() internal view {
        require(!_inDefault, "Loan has defaulted already");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining != 0, "Loan has been paid for");
        require(msg.sender == _borrower, "Incorrect sender in request");
        require(!_requestPaidEarly, "Already requested early repaiment");
    }

    function requestEarlyRepaiment() public payable {
        _checkRequestEarlyRepaiment();
        require(_isEth, "Repaiment must be in loan currency");
        _requestPaidEarlyAmount = msg.value;
        _requestPaidEarly = true;
        emit RequestEarlyRepayment(msg.value);
    }

    function requestEarlyRepaiment(uint256 amount) public {
        _checkRequestEarlyRepaiment();
        require(!_isEth, "Repaiment must be in loan currency");
        _requestPaidEarlyAmount = amount;
        _requestPaidEarly = true;
        emit RequestEarlyRepayment(amount);
    }

    function _earlyRepaimentDecisionCheck() internal view {
        require(!_inDefault, "Loan has defaulted already");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining != 0, "Loan has been paid for");
        require(_requestPaidEarly, "Early repaiment not requested");
    }

    function rejectEarlyRepaiment() public {
        _earlyRepaimentDecisionCheck();
        require(msg.sender == _lender || msg.sender == _borrower, "Incorrect sender in request");
        if (_isEth) {
            (bool okReturn,) = _borrower.call{ value: _requestPaidEarlyAmount }("");
            require(okReturn, "Could not return requested early repayment");
        }
        _requestPaidEarly = false;
        _requestPaidEarlyAmount = 0;
        emit RejectEarlyRepayment();
    }

    function acceptEarlyRepaiment() public {
        _earlyRepaimentDecisionCheck();
        require(msg.sender == _lender, "Incorrect sender in request");
        _paidEarly = true;
        if (_isEth) {
            (bool ok,) = _lender.call{ value: _requestPaidEarlyAmount }("");
            require(ok, "Early repaiment transaction failed");
        } else {
            require(_coin.allowance(_borrower, _lender) > _requestPaidEarlyAmount, "Not enough allowance in borrowers wallet");
            bool ok = _coin.transferFrom(_borrower, _lender, _requestPaidEarlyAmount);
            require(ok, "Early repaiment transaction failed");
        }
        emit AcceptEarlyRepayment(_requestPaidEarlyAmount);
    }

    function defaultOnLoan() public {
        require(_lastPayment + _defaultLimit > block.timestamp, "Borrower has not yet reached default time");
        require(msg.sender == _lender, "Only lender can trigger default");
        require(!_inDefault, "Loan already in default");
        require(_remaining > 0, "Loan paid off fully");
        _inDefault = true;
        if (_isEth) {
            (bool ok,) = msg.sender.call{ value: _collateral }("");
            require(ok, "Collateral payment failed");
            if (_requestPaidEarly) {
                _requestPaidEarly = false;
                _requestPaidEarlyAmount = 0;
                (bool okReturnEarly,) = _borrower.call{ value: _requestPaidEarlyAmount }("");
                require(okReturnEarly, "Could not return early repayment request");
            }
        } else {
            bool ok = _coin.transfer(_lender, _collateral);
            require(ok, "Collateral payment failed");
        }
        emit DefaultOnLoan(block.timestamp, _collateral);
    }
}

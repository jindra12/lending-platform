// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {IERC20Metadata} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract LendingPlatform is Ownable {
    struct LoanData {
        uint256 amount;
        uint256 toBePaid;
        uint256 interval;
        uint256 singlePayment;
        uint256 collateral;
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

    mapping(address => mapping(address => LoanProgress)) internal _loansByLenders;
    mapping(address => address) internal _loansByBorrowers;
    mapping(address => uint256) internal _loanLimit;

    LoanOffer[] internal _loanOffers;

    uint256 internal _loanOfferId = 1;

    event IssuedLoan(uint256[4] details, string indexed symbol);

    function _loanCheck(uint256 amount, uint256 toBePaid, uint256 singlePayment) internal pure {
        require(amount < toBePaid, "Invalid amount");
        require(singlePayment < toBePaid, "Invalid single payment");
        require(toBePaid % singlePayment == 0, "Single payment non divisible by toBePaid");
    }

    function _fillLoanDetails(uint256 amount, uint256 toBePaid, uint256 interval, uint256 singlePayment, uint256 collateral) internal pure returns(LoanData memory) {
        LoanData memory loanData;
        loanData.amount = amount;
        loanData.toBePaid = toBePaid;
        loanData.interval = interval;
        loanData.collateral = collateral;
        loanData.singlePayment = singlePayment;
        return loanData;
    }

    function offerLoan(uint256 toBePaid, uint256 interval, uint256 singlePayment, uint256 collateral) public payable {
        _loanCheck(msg.value, toBePaid, singlePayment);
        LoanData memory loanData = _fillLoanDetails(msg.value, toBePaid, interval, singlePayment, collateral);
        LoanOffer memory loanOffer;
        loanOffer.loanData = loanData;
        loanOffer.from = msg.sender;
        loanOffer.id = _loanOfferId;
        loanOffer.isEth = true;
        _loanOfferId++;
        _loanOffers.push(loanOffer);
        uint256[4] memory details = [msg.value, toBePaid, interval, collateral];
        emit IssuedLoan(details, "eth");
    }

    function offerLoan(uint256 amount, uint256 toBePaid, uint256 interval, uint256 singlePayment, uint256 collateral, IERC20Metadata coin) public {
        _loanCheck(amount, toBePaid, singlePayment);
        LoanData memory loanData = _fillLoanDetails(amount, toBePaid, interval, singlePayment, collateral);
        LoanOffer memory loanOffer;
        loanOffer.loanData = loanData;
        loanOffer.from = msg.sender;
        loanOffer.id = _loanOfferId;
        loanOffer.coin = coin;
        _loanOfferId++;
        _loanOffers.push(loanOffer);
        uint256[4] memory details = [amount, toBePaid, interval, collateral];
        emit IssuedLoan(details, loanOffer.coin.name());
    }

    function increaseLoanLimit(address to, uint256 amount) onlyOwner public {
        _loanLimit[to] = amount;
    }

    function acceptLoan(address from, uint256 getFromIndex, uint256 id) public payable returns(Loan) {
        LoanOffer memory loanOfferAt = _loanOffers[getFromIndex];
        require(loanOfferAt.id == id, "Loan already taken, try again");
        require(loanOfferAt.loanData.amount < _loanLimit[from], "Trying to borrow too much");

        if (getFromIndex == _loanOffers.length - 1) {
            _loanOffers.pop();
        } else {
            LoanOffer memory lastLoan = _loanOffers[_loanOffers.length - 1];
            _loanOffers[getFromIndex] = lastLoan;
            _loanOffers.pop();
        }

        Loan loan = new Loan(loanOfferAt.from, msg.sender, loanOfferAt.loanData.toBePaid, loanOfferAt.loanData.singlePayment, loanOfferAt.loanData.interval, block.timestamp, loanOfferAt.loanData.collateral);

        if (loanOfferAt.isEth) {
            loan.setIsEth();
            require(msg.value == loanOfferAt.loanData.collateral, "Message did not contain enough eth for collateral");
            (bool ok,) = msg.sender.call{ value: loanOfferAt.loanData.amount }("");
            require(ok, "Loan failed");
            (bool collateralTransfer,) = address(loan).call{ value: loanOfferAt.loanData.collateral }("");
            require(collateralTransfer, "Failed to transfer value to loan");
        } else {
            loan.setCoin(loanOfferAt.coin);
            require(loanOfferAt.coin.allowance(msg.sender, address(this)) > loanOfferAt.loanData.collateral, "Not enough allowance for collateral");
            require(loanOfferAt.coin.allowance(loanOfferAt.from, msg.sender) > loanOfferAt.loanData.amount, "Not enough allowance for the loan to go through");
            bool okcollateral = loanOfferAt.coin.transferFrom(msg.sender, address(this), loanOfferAt.loanData.collateral);
            require(okcollateral, "Collateral transfer failed");
            bool okloan = loanOfferAt.coin.transferFrom(loanOfferAt.from, msg.sender, loanOfferAt.loanData.amount);
            require(okloan, "Loan failed");
        }

        return loan;
    }
}

contract Loan {
    address internal _lender;
    address internal _borrower;
    uint256 internal _remaining;
    uint256 internal _singlePayment;
    uint256 internal _interval;
    uint256 internal _lastPayment;
    uint256 internal _collateral;

    IERC20Metadata internal _coin;
    bool internal _isEth;
    bool internal _inDefault;
    bool internal _paidEarly;

    constructor(address lender, address borrower, uint256 remaining, uint256 singlePayment, uint256 interval, uint256 lastPayment, uint256 collateral) {
        _lender = lender;
        _borrower = borrower;
        _remaining = remaining;
        _singlePayment = singlePayment;
        _interval = interval;
        _lastPayment = lastPayment;
        _collateral = collateral;
    }

    function setIsEth() public {
        _isEth = true;
    }

    function setCoin(IERC20Metadata coin) public {
        _coin = coin;
    }

    function doPayment() public payable {
        require(_lastPayment + _interval > block.timestamp, "Not yet time to pay your loan");
        require(!_inDefault, "Loan has been defaulted on");
        require(!_paidEarly, "Loan has been paid early");
        require(_remaining > _singlePayment, "Loan has been paid on time");
        
        if (_isEth) {
            require(msg.value == _singlePayment, "Incorrect value of message value, must equal your single payment");
            (bool ok,) = _lender.call{ value: _singlePayment }("");
            require(ok, "Payment couldn't be processed");
        } else {
            require(_coin.allowance(msg.sender, _lender) > _singlePayment, "There is not enough allowance to settle your payment");
            bool ok = _coin.transferFrom(msg.sender, _lender, _singlePayment);
            require(ok, "Payment couldn't be processed");
        }

        _lastPayment = block.timestamp;
        _remaining -= _singlePayment;
    }
}

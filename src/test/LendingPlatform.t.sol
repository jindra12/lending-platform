// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {LendingPlatform,LendingPlatFormStructs,LendingPlatformEvents,Loan} from "../src/LendingPlatform.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract OneCoin is ERC20("OneCoin", "one") {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract TwoCoin is ERC20("TwoCoin", "two") {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract LendingPlatformTest is Test,LendingPlatFormStructs,LendingPlatformEvents {
    LendingPlatform public lendingPlatform;
    OneCoin public oneCoin;
    TwoCoin public twoCoin;
    address public andrea;
    address public barry;
    address public mallory;

    uint256 immutable amount = 500;
    uint256 immutable toBePaid = 1000;
    uint256 immutable interval = 100;
    uint256 immutable defaultLimit = 700;
    uint256 immutable collateral = 100;
    uint256 immutable singlePayment = 100;
    uint256 immutable loanFee = 100;

    function makeAccount(uint32 random, uint256 funds) internal returns(address) {
        string memory mnemonic = "test test test test test test test test test test test junk";
        uint256 privateKey = vm.deriveKey(mnemonic, random);
        address addr = vm.addr(privateKey);
        (bool ok,) = addr.call{ value: funds }("");
        assertEq(ok, true);
        return addr;
    }

    function setUp() public {
        oneCoin = new OneCoin();
        twoCoin = new TwoCoin();
        lendingPlatform = new LendingPlatform();
        lendingPlatform.setLoanFee(100);
        andrea = makeAccount(1, 1000);
        barry = makeAccount(2, 600);
        mallory = makeAccount(3, 300);
    }

    function _testIssuanceEthEth() internal {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoanEthEth{ value: amount }(toBePaid, interval, defaultLimit, singlePayment, collateral);
    }

    function _testIssuanceEthCoin() internal {
        oneCoin.mint(barry, collateral);
        vm.prank(barry);
        oneCoin.approve(address(lendingPlatform), collateral);
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoanEthCoin{ value: amount }(toBePaid, interval, defaultLimit, singlePayment, collateral, oneCoin);
    }

    function _testIssuanceCoinEth() internal {
        oneCoin.mint(andrea, amount);
        vm.prank(andrea);
        oneCoin.approve(address(lendingPlatform), amount);
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoanCoinEth(amount, toBePaid, interval, defaultLimit, singlePayment, collateral, oneCoin);
    }

    function _testIssuanceCoinCoin() internal {
        oneCoin.mint(andrea, amount);
        vm.prank(andrea);
        oneCoin.approve(address(lendingPlatform), amount);
        twoCoin.mint(barry, amount);
        vm.prank(barry);
        twoCoin.approve(address(lendingPlatform), collateral);
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoanCoinCoin(amount, toBePaid, interval, defaultLimit, singlePayment, collateral, oneCoin, twoCoin);
    }

    function testIssuanceEthEth() public {
        _testIssuanceEthEth();
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, true);
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, amount);
        assertEq(loanOffer.loanData.collateral.value, collateral);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, true);
        assertEq(loanOffer.loanData.defaultLimit, defaultLimit);
        assertEq(loanOffer.loanData.interval, interval);
        assertEq(loanOffer.loanData.singlePayment, singlePayment);
        assertEq(loanOffer.loanData.toBePaid, toBePaid);
    }

    function testIssuanceEthCoin() public {
        _testIssuanceEthCoin();
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, true);
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, amount);
        assertEq(loanOffer.loanData.collateral.value, collateral);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, false);
        assertEq(address(loanOffer.loanData.collateral.collateralCoin), address(oneCoin));
        assertEq(loanOffer.loanData.defaultLimit, defaultLimit);
        assertEq(loanOffer.loanData.interval, interval);
        assertEq(loanOffer.loanData.singlePayment, singlePayment);
        assertEq(loanOffer.loanData.toBePaid, toBePaid);
    }

    function testIssuanceCoinEth() public {
        _testIssuanceCoinEth();
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, false);
        assertEq(address(loanOffer.coin), address(oneCoin));
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, amount);
        assertEq(loanOffer.loanData.collateral.value, collateral);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, true);
        assertEq(loanOffer.loanData.defaultLimit, defaultLimit);
        assertEq(loanOffer.loanData.interval, interval);
        assertEq(loanOffer.loanData.singlePayment, singlePayment);
        assertEq(loanOffer.loanData.toBePaid, toBePaid);
    }

    function testIssuanceCoinCoin() public {
        _testIssuanceCoinCoin();
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, false);
        assertEq(address(loanOffer.coin), address(oneCoin));
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, amount);
        assertEq(loanOffer.loanData.collateral.value, collateral);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, false);
        assertEq(address(loanOffer.loanData.collateral.collateralCoin), address(twoCoin));
        assertEq(loanOffer.loanData.defaultLimit, defaultLimit);
        assertEq(loanOffer.loanData.interval, interval);
        assertEq(loanOffer.loanData.singlePayment, singlePayment);
        assertEq(loanOffer.loanData.toBePaid, toBePaid);
    }

    function testAcceptanceEthEth() public {
        _testIssuanceEthEth();
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount);

        vm.prank(barry);
        vm.expectEmit(false, false, false, false, address(lendingPlatform));
        emit AcceptedLoan(address(0));
        Loan loan = lendingPlatform.acceptLoan{ value: collateral }(1);
        assertEq(lendingPlatform.getLoanLimit(barry), 0);

        assertEq(loan.getBorrower(), barry);
        vm.expectRevert("Loan was done in eth, not ERC20");
        loan.getCoin();
        vm.expectRevert("Collateral was set in eth, not ERC20");
        loan.getCollateralCoin();
        assertEq(loan.getCollateral(), collateral);
        assertEq(loan.getCollateralEth(), true);
        assertEq(loan.getDefaultLimit(), defaultLimit);
        assertEq(loan.getInterval(), interval);
        assertEq(loan.getIsDefault(), false);
        assertEq(loan.getIsEth(), true);
        assertEq(loan.getLastPayment(), 0);
        assertEq(loan.getLender(), andrea);
        assertEq(loan.getPaidEarly(), false);
        assertEq(loan.getRemaining(), toBePaid);
        assertEq(loan.getRequestPaidEarly(), false);
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();
        assertEq(loan.getSinglePayment(), singlePayment);
    }

    function testAcceptanceCoinEth() public {
        _testIssuanceCoinEth();
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount, oneCoin);

        vm.prank(barry);
        vm.expectEmit(false, false, false, false, address(lendingPlatform));
        emit AcceptedLoan(address(0));
        Loan loan = lendingPlatform.acceptLoan{ value: collateral }(1);
        assertEq(lendingPlatform.getLoanLimit(barry), 0);

        assertEq(loan.getBorrower(), barry);
        assertEq(address(loan.getCoin()), address(oneCoin));
        vm.expectRevert("Collateral was set in eth, not ERC20");
        loan.getCollateralCoin();
        assertEq(loan.getCollateral(), collateral);
        assertEq(loan.getCollateralEth(), true);
        assertEq(loan.getDefaultLimit(), defaultLimit);
        assertEq(loan.getInterval(), interval);
        assertEq(loan.getIsDefault(), false);
        assertEq(loan.getIsEth(), false);
        assertEq(loan.getLastPayment(), 0);
        assertEq(loan.getLender(), andrea);
        assertEq(loan.getPaidEarly(), false);
        assertEq(loan.getRemaining(), toBePaid);
        assertEq(loan.getRequestPaidEarly(), false);
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();
        assertEq(loan.getSinglePayment(), singlePayment);
    }

    function testAcceptanceEthCoin() public {
        _testIssuanceEthCoin();
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount);

        vm.prank(barry);
        vm.expectEmit(false, false, false, false, address(lendingPlatform));
        emit AcceptedLoan(address(0));
        Loan loan = lendingPlatform.acceptLoan{ value: collateral }(1);
        assertEq(lendingPlatform.getLoanLimit(barry), 0);

        assertEq(loan.getBorrower(), barry);
        vm.expectRevert("Loan was done in eth, not ERC20");
        loan.getCoin();
        assertEq(address(loan.getCollateralCoin()), address(oneCoin));
        assertEq(loan.getCollateral(), collateral);
        assertEq(loan.getCollateralEth(), false);
        assertEq(loan.getDefaultLimit(), defaultLimit);
        assertEq(loan.getInterval(), interval);
        assertEq(loan.getIsDefault(), false);
        assertEq(loan.getIsEth(), true);
        assertEq(loan.getLastPayment(), 0);
        assertEq(loan.getLender(), andrea);
        assertEq(loan.getPaidEarly(), false);
        assertEq(loan.getRemaining(), toBePaid);
        assertEq(loan.getRequestPaidEarly(), false);
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();
        assertEq(loan.getSinglePayment(), singlePayment);
    }

    /*function testAcceptanceCoinCoin() public {

    }

    function testPaymentEthEth() public {

    }

    function testPaymentEthCoin() public {

    }

    function testPaymentCoinEth() public {

    }

    function testPaymentCoinCoin() public {

    }

    function testDefaultEthEth() public {

    }

    function testDefaultEthCoin() public {

    }

    function testDefaultCoinEth() public {

    }

    function testDefaultCoinCoin() public {

    }

    function testEarlyRepaiment() public {

    }

    function testEarlyRepaimentRefusal() public {

    }

    function testEarlyRepaimentEth() public {

    }

    function testEarlyRepaimentCoin() public {

    }*/
}

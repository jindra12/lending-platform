// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {LendingPlatform,LendingPlatFormStructs,LendingPlatformEvents,Loan} from "../src/LendingPlatform.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ENS} from "../lib/ens-contracts/contracts/registry/ENS.sol";

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
    uint256 immutable earlyRepayment = 800;
    bytes public emptyBytes;

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
        lendingPlatform = new LendingPlatform(ENS(address(0)), "test.eth", 0x0);
        lendingPlatform.setLoanFee(100);
        andrea = makeAccount(1, 1000);
        barry = makeAccount(2, 600);
        mallory = makeAccount(3, 300);
        emptyBytes = new bytes(0);
    }

    function _testIssuanceEthEth(uint256 loanId) internal {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, true, false, false, address(lendingPlatform));
        emit IssuedLoan(loanId, andrea);
        lendingPlatform.offerLoanEthEth{ value: amount }(toBePaid, interval, defaultLimit, singlePayment, collateral);
    }

    function _testIssuanceEthCoin(uint256 loanId) internal {
        oneCoin.mint(barry, collateral);
        vm.prank(barry);
        oneCoin.approve(address(lendingPlatform), collateral);
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, true, false, false, address(lendingPlatform));
        emit IssuedLoan(loanId, andrea);
        lendingPlatform.offerLoanEthCoin{ value: amount }(toBePaid, interval, defaultLimit, singlePayment, collateral, oneCoin);
    }

    function _testIssuanceCoinEth(uint256 loanId) internal {
        oneCoin.mint(andrea, amount);
        vm.prank(andrea);
        oneCoin.approve(address(lendingPlatform), amount);
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, true, false, false, address(lendingPlatform));
        emit IssuedLoan(loanId, andrea);
        lendingPlatform.offerLoanCoinEth(amount, toBePaid, interval, defaultLimit, singlePayment, collateral, oneCoin);
    }

    function _testIssuanceCoinCoin(uint256 loanId) internal {
        oneCoin.mint(andrea, amount);
        vm.prank(andrea);
        oneCoin.approve(address(lendingPlatform), amount);
        twoCoin.mint(barry, amount);
        vm.prank(barry);
        twoCoin.approve(address(lendingPlatform), collateral);
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, true, false, false, address(lendingPlatform));
        emit IssuedLoan(loanId, andrea);
        lendingPlatform.offerLoanCoinCoin(amount, toBePaid, interval, defaultLimit, singlePayment, collateral, oneCoin, twoCoin);
    }

    function _testIssuanceEthEth() internal {
        _testIssuanceEthEth(1);
    }

    function _testIssuanceEthCoin() internal {
        _testIssuanceEthCoin(1);
    }

    function _testIssuanceCoinEth() internal {
        _testIssuanceCoinEth(1);
    }

    function _testIssuanceCoinCoin() internal {
        _testIssuanceCoinCoin(1);
    }

    function _testAcceptanceEthEth() internal returns(Loan) {
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount, 1);

        vm.prank(barry);
        vm.expectEmit(true, true, true, false, address(lendingPlatform));
        emit AcceptedLoan(1, andrea, barry, address(0));
        return lendingPlatform.acceptLoan{ value: collateral }(1);
    }

    function _testAcceptanceEthCoin() internal returns(Loan) {
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount, 1);

        vm.prank(barry);
        vm.expectEmit(true, true, true, false, address(lendingPlatform));
        emit AcceptedLoan(1, andrea, barry, address(0));
        return lendingPlatform.acceptLoan{ value: collateral }(1);
    }

    function _testAcceptanceCoinEth() internal returns(Loan) {
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount, oneCoin, 1);

        vm.prank(barry);
        vm.expectEmit(true, true, true, false, address(lendingPlatform));
        emit AcceptedLoan(1, andrea, barry, address(0));
        return lendingPlatform.acceptLoan{ value: collateral }(1);
    }

    function _testAcceptanceCoinCoin() internal returns(Loan) {
        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanFee(loanFee);

        vm.prank(barry);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        vm.prank(lendingPlatform.owner());
        lendingPlatform.setLoanLimit(barry, amount, oneCoin, 1);

        vm.prank(barry);
        vm.expectEmit(true, true, true, false, address(lendingPlatform));
        emit AcceptedLoan(1, andrea, barry, address(0));
        return lendingPlatform.acceptLoan{ value: collateral }(1);
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
        assertEq(oneCoin.balanceOf(address(lendingPlatform)), amount);
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
        assertEq(oneCoin.balanceOf(address(lendingPlatform)), amount);
    }

    function testAcceptanceEthEth() public {
        _testIssuanceEthEth();
        Loan loan = _testAcceptanceEthEth();
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

    function testAcceptanceEthCoin() public {
        _testIssuanceEthCoin();
        Loan loan = _testAcceptanceEthCoin();
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
        assertEq(oneCoin.balanceOf(address(loan)), collateral);
    }

    function testAcceptanceCoinEth() public {
        _testIssuanceCoinEth();
        Loan loan = _testAcceptanceCoinEth();
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

    function testAcceptanceCoinCoin() public {
        _testIssuanceCoinCoin();
        Loan loan = _testAcceptanceCoinCoin();
        assertEq(lendingPlatform.getLoanLimit(barry), 0);

        assertEq(loan.getBorrower(), barry);
        assertEq(address(loan.getCoin()), address(oneCoin));
        assertEq(address(loan.getCollateralCoin()), address(twoCoin));
        assertEq(loan.getCollateral(), collateral);
        assertEq(loan.getCollateralEth(), false);
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
        assertEq(twoCoin.balanceOf(address(loan)), collateral);
    }

    function testPaymentEthEth() public {
        _testIssuanceEthEth();
        Loan loan = _testAcceptanceEthEth();

        uint256 numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 10);

        (bool ok,) = barry.call{ value: singlePayment * numberOfPayments }("");
        (bool ok2,) = mallory.call{ value: singlePayment * numberOfPayments }("");
        assertTrue(ok);
        assertTrue(ok2);
    
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment{ value: singlePayment }();
        
        vm.prank(barry);
        vm.warp(interval);
        vm.expectRevert("Incorrect value of message value, must equal your single payment");
        loan.doPayment();
        
        vm.prank(barry);
        loan.doPayment{ value: singlePayment }();
        assertEq(loan.getRemaining(), toBePaid - singlePayment);
    
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment{ value: singlePayment }();
    
        vm.warp(2 * interval);
        vm.prank(mallory);
        vm.expectRevert("Only borrower can repay a loan");
        loan.doPayment{ value: singlePayment }();

        numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 9);
        for (uint256 i = 0; i < numberOfPayments; i++) {
            vm.prank(barry);
            if (i == numberOfPayments - 1) {
                vm.expectCall(address(barry), collateral, emptyBytes);
                loan.doPayment{ value: singlePayment }();
            } else {
                loan.doPayment{ value: singlePayment }();
            }
            vm.warp((3 + i) * interval);
            if (i != numberOfPayments - 1) {
                assertTrue(loan.canDoPayment());
            }
        }

        vm.prank(barry);
        vm.expectRevert("Loan has been paid on time");
        loan.doPayment{ value: singlePayment }();

        assertEq(loan.getRemaining(), 0);

        vm.prank(address(loan));
        (bool ok3,) = barry.call{ value: 1 }(""); // Wallet should be empty
        assertFalse(ok3);

        assertFalse(loan.canDoPayment());
    }

    function testPaymentEthCoin() public {
        _testIssuanceEthCoin();
        Loan loan = _testAcceptanceEthCoin();

        uint256 numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 10);

        (bool ok,) = barry.call{ value: singlePayment * numberOfPayments }("");
        (bool ok2,) = mallory.call{ value: singlePayment * numberOfPayments }("");
        assertTrue(ok);
        assertTrue(ok2);
    
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment{ value: singlePayment }();
        
        vm.prank(barry);
        vm.warp(interval);
        vm.expectRevert("Incorrect value of message value, must equal your single payment");
        loan.doPayment();
        
        vm.prank(barry);
        loan.doPayment{ value: singlePayment }();
        assertEq(loan.getRemaining(), toBePaid - singlePayment);
    
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment{ value: singlePayment }();
    
        vm.warp(2 * interval);
        vm.prank(mallory);
        vm.expectRevert("Only borrower can repay a loan");
        loan.doPayment{ value: singlePayment }();

        numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 9);
        for (uint256 i = 0; i < numberOfPayments; i++) {
            vm.prank(barry);
            if (i == numberOfPayments - 1) {
                loan.doPayment{ value: singlePayment }();
            } else {
                loan.doPayment{ value: singlePayment }();
            }
            vm.warp((3 + i) * interval);
            if (i != numberOfPayments - 1) {
                assertTrue(loan.canDoPayment());
            }
        }

        vm.expectRevert("Loan has been paid on time");
        loan.doPayment{ value: singlePayment }();

        assertEq(loan.getRemaining(), 0);

        vm.prank(address(loan));
        (bool ok3,) = barry.call{ value: 1 }(""); // Wallet should be empty
        assertFalse(ok3);

        assertEq(oneCoin.balanceOf(barry), collateral);
        assertEq(oneCoin.balanceOf(address(loan)), 0);
    }

    function testPaymentCoinEth() public {
        _testIssuanceCoinEth();
        Loan loan = _testAcceptanceCoinEth();

        uint256 numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 10);

        oneCoin.mint(barry, loan.getRemaining());
        oneCoin.mint(mallory, loan.getRemaining());
    
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment();
        
        vm.prank(barry);
        vm.warp(interval);
        vm.expectRevert("There is not enough allowance to settle your payment");
        loan.doPayment();
        
        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);
        vm.prank(barry);
        loan.doPayment();
        assertEq(loan.getRemaining(), toBePaid - singlePayment);
    
        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment();
    
        vm.warp(2 * interval);
        vm.prank(mallory);
        oneCoin.approve(address(loan), singlePayment);
        vm.prank(mallory);
        vm.expectRevert("Only borrower can repay a loan");
        loan.doPayment();

        numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 9);
        for (uint256 i = 0; i < numberOfPayments; i++) {
            vm.prank(barry);
            oneCoin.approve(address(loan), singlePayment);
            vm.prank(barry);
            if (i == numberOfPayments - 1) {
                vm.expectCall(address(barry), collateral, emptyBytes);
                loan.doPayment();
            } else {
                loan.doPayment();
            }
            vm.warp((3 + i) * interval);
            if (i != numberOfPayments - 1) {
                assertTrue(loan.canDoPayment());
            }
        }

        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);

        vm.prank(barry);
        vm.expectRevert("Loan has been paid on time");
        loan.doPayment();

        assertEq(loan.getRemaining(), 0);

        vm.prank(address(loan));
        (bool ok3,) = barry.call{ value: 1 }(""); // Wallet should be empty
        assertFalse(ok3);
        assertEq(oneCoin.balanceOf(address(loan)), 0);
    }

    function testPaymentCoinCoin() public {
        _testIssuanceCoinCoin();
        Loan loan = _testAcceptanceCoinCoin();

        uint256 numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 10);

        oneCoin.mint(barry, loan.getRemaining());
        oneCoin.mint(mallory, loan.getRemaining());
    
        assertFalse(loan.canDoPayment());
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment();
        
        vm.prank(barry);
        vm.warp(interval);
        vm.expectRevert("There is not enough allowance to settle your payment");
        loan.doPayment();
        
        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);
        vm.prank(barry);
        loan.doPayment();
        assertEq(loan.getRemaining(), toBePaid - singlePayment);
    
        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);
        vm.prank(barry);
        vm.expectRevert("Not yet time to pay your loan");
        loan.doPayment();
    
        vm.warp(2 * interval);
        vm.prank(mallory);
        oneCoin.approve(address(loan), singlePayment);
        vm.prank(mallory);
        vm.expectRevert("Only borrower can repay a loan");
        loan.doPayment();

        numberOfPayments = loan.getRemaining() / loan.getSinglePayment();
        assertEq(numberOfPayments, 9);
        assertEq(twoCoin.balanceOf(address(loan)), collateral);
        for (uint256 i = 0; i < numberOfPayments; i++) {
            vm.prank(barry);
            oneCoin.approve(address(loan), singlePayment);
            vm.prank(barry);
            if (i == numberOfPayments - 1) {
                loan.doPayment();
                assertEq(twoCoin.balanceOf(address(loan)), 0);
            } else {
                loan.doPayment();
            }
            vm.warp((3 + i) * interval);
            if (i != numberOfPayments - 1) {
                assertTrue(loan.canDoPayment());
            }
        }

        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);

        vm.prank(barry);
        vm.expectRevert("Loan has been paid on time");
        loan.doPayment();

        assertEq(loan.getRemaining(), 0);

        vm.prank(address(loan));
        (bool ok3,) = barry.call{ value: 1 }(""); // Wallet should be empty
        assertFalse(ok3);
        assertEq(oneCoin.balanceOf(address(loan)), 0);
    }

    function testDefaultEthEth() public {
        _testIssuanceEthEth();
        Loan loan = _testAcceptanceEthEth();
        vm.prank(andrea);
        vm.expectRevert("Borrower has not yet reached default time");
        loan.defaultOnLoan();
        vm.warp(interval);
        vm.prank(barry);
        loan.doPayment{ value: singlePayment }();
        vm.warp(interval + defaultLimit);
        vm.prank(mallory);
        vm.expectRevert("Only lender can trigger default");
        loan.defaultOnLoan();
        vm.prank(andrea);
        vm.expectCall(andrea, collateral, emptyBytes);
        loan.defaultOnLoan();
        assertTrue(loan.getIsDefault());
        vm.prank(andrea);
        vm.expectRevert("Loan already in default");
        loan.defaultOnLoan();
    }

    function testDefaultEthCoin() public {
        _testIssuanceEthCoin();
        Loan loan = _testAcceptanceEthCoin();
        vm.prank(andrea);
        vm.expectRevert("Borrower has not yet reached default time");
        loan.defaultOnLoan();

        vm.warp(interval);
        vm.prank(barry);
        loan.doPayment{ value: singlePayment }();

        vm.warp(interval + defaultLimit);
        vm.prank(mallory);
        vm.expectRevert("Only lender can trigger default");
        loan.defaultOnLoan();

        assertEq(oneCoin.balanceOf(address(loan)), collateral);
        vm.prank(andrea);
        loan.defaultOnLoan();
        assertEq(oneCoin.balanceOf(address(loan)), 0);
        assertEq(oneCoin.balanceOf(andrea), collateral);
        assertTrue(loan.getIsDefault());

        vm.prank(andrea);
        vm.expectRevert("Loan already in default");
        loan.defaultOnLoan();
    }

    function testDefaultCoinEth() public {
        _testIssuanceCoinEth();
        Loan loan = _testAcceptanceCoinEth();
        oneCoin.mint(barry, singlePayment);
        oneCoin.mint(mallory, singlePayment);

        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);

        vm.prank(mallory);
        oneCoin.approve(address(loan), singlePayment);

        vm.prank(andrea);
        vm.expectRevert("Borrower has not yet reached default time");
        loan.defaultOnLoan();
        vm.warp(interval);
        vm.prank(barry);
        loan.doPayment();
        vm.warp(interval + defaultLimit);
        vm.prank(mallory);
        vm.expectRevert("Only lender can trigger default");
        loan.defaultOnLoan();
        vm.prank(andrea);
        vm.expectCall(andrea, collateral, emptyBytes);
        loan.defaultOnLoan();
        assertTrue(loan.getIsDefault());
        vm.prank(andrea);
        vm.expectRevert("Loan already in default");
        loan.defaultOnLoan();
    }

    function testDefaultCoinCoin() public {
        _testIssuanceCoinCoin();
        Loan loan = _testAcceptanceCoinCoin();
        oneCoin.mint(barry, singlePayment);
        oneCoin.mint(mallory, singlePayment);

        vm.prank(barry);
        oneCoin.approve(address(loan), singlePayment);

        vm.prank(mallory);
        oneCoin.approve(address(loan), singlePayment);

        assertFalse(loan.canDefaultOnLoan());
        vm.prank(andrea);
        vm.expectRevert("Borrower has not yet reached default time");
        loan.defaultOnLoan();
        vm.warp(interval);
        vm.prank(barry);
        loan.doPayment();
        vm.warp(interval + defaultLimit);
        assertTrue(loan.canDefaultOnLoan());
        vm.prank(mallory);
        vm.expectRevert("Only lender can trigger default");
        loan.defaultOnLoan();
        assertEq(twoCoin.balanceOf(address(loan)), collateral);
        vm.prank(andrea);
        loan.defaultOnLoan();
        assertTrue(loan.getIsDefault());
        assertEq(twoCoin.balanceOf(address(loan)), 0);
        assertEq(twoCoin.balanceOf(andrea), collateral);
        assertFalse(loan.canDefaultOnLoan());
        vm.prank(andrea);
        vm.expectRevert("Loan already in default");
        loan.defaultOnLoan();
    }

    function testEarlyRepaymentEthEth() public {
        _testIssuanceEthEth();
        Loan loan = _testAcceptanceEthEth();

        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();

        (bool earlyRepaymentRequested,) = barry.call{ value: earlyRepayment }("");
        assertTrue(earlyRepaymentRequested);
        vm.prank(barry);
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();

        vm.prank(barry);
        vm.expectRevert("Already requested early repayment");
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();

        vm.prank(mallory);
        vm.expectRevert("Incorrect sender in request");
        loan.acceptEarlyRepayment();

        vm.prank(andrea);
        vm.expectCall(barry, collateral, emptyBytes);
        vm.expectCall(andrea, earlyRepayment, emptyBytes);
        loan.acceptEarlyRepayment();

        vm.prank(address(loan));
        (bool shouldFail,) = barry.call{ value: 1 }("");
        assertFalse(shouldFail);
        assertTrue(loan.getPaidEarly());
    }

    function testEarlyRepaymentEthCoin() public {
        _testIssuanceEthCoin();
        Loan loan = _testAcceptanceEthCoin();

        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();

        (bool earlyRepaymentRequested,) = barry.call{ value: earlyRepayment }("");
        assertTrue(earlyRepaymentRequested);
        vm.prank(barry);
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();

        vm.prank(barry);
        vm.expectRevert("Already requested early repayment");
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();

        vm.prank(mallory);
        vm.expectRevert("Incorrect sender in request");
        loan.acceptEarlyRepayment();

        assertEq(oneCoin.balanceOf(address(loan)), collateral);
        vm.expectCall(andrea, earlyRepayment, emptyBytes);
        vm.prank(andrea);
        loan.acceptEarlyRepayment();
        assertEq(oneCoin.balanceOf(address(loan)), 0);
        assertEq(oneCoin.balanceOf(barry), collateral);

        vm.prank(address(loan));
        (bool shouldFail,) = barry.call{ value: 1 }("");
        assertFalse(shouldFail);
        assertTrue(loan.getPaidEarly());
    }

    function testEarlyRepaymentCoinEth() public {
        _testIssuanceCoinEth();
        Loan loan = _testAcceptanceCoinEth();
        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();

        assertTrue(loan.canRequestEarlyRepayment());
        oneCoin.mint(barry, earlyRepayment);
        vm.prank(barry);
        oneCoin.approve(address(loan), earlyRepayment);
        vm.prank(barry);
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        vm.prank(mallory);
        vm.expectRevert("Incorrect sender in request");
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        vm.prank(barry);
        vm.expectRevert("Already requested early repayment");
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        vm.prank(mallory);
        vm.expectRevert("Incorrect sender in request");
        loan.acceptEarlyRepayment();

        assertFalse(loan.canRequestEarlyRepayment());
        assertTrue(loan.canDoEarlyRepayment());
        assertEq(oneCoin.balanceOf(address(loan)), earlyRepayment);
        vm.prank(andrea);
        vm.expectCall(barry, collateral, emptyBytes);
        loan.acceptEarlyRepayment();
        assertEq(oneCoin.balanceOf(address(loan)), 0);

        vm.prank(address(loan));
        (bool shouldFail,) = barry.call{ value: 1 }("");
        assertFalse(shouldFail);
        assertTrue(loan.getPaidEarly());
    }

    function testEarlyRepaymentCoinCoin() public {
        _testIssuanceCoinCoin();
        Loan loan = _testAcceptanceCoinCoin();
        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();

        assertTrue(loan.canRequestEarlyRepayment());
        oneCoin.mint(barry, earlyRepayment);
        vm.prank(barry);
        oneCoin.approve(address(loan), earlyRepayment);
        vm.prank(barry);
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        vm.prank(mallory);
        vm.expectRevert("Incorrect sender in request");
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        assertFalse(loan.canRequestEarlyRepayment());
        vm.prank(barry);
        vm.expectRevert("Already requested early repayment");
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        vm.prank(mallory);
        vm.expectRevert("Incorrect sender in request");
        loan.acceptEarlyRepayment();

        assertTrue(loan.canDoEarlyRepayment());
        assertEq(oneCoin.balanceOf(address(loan)), earlyRepayment);
        vm.prank(andrea);
        loan.acceptEarlyRepayment();
        assertEq(oneCoin.balanceOf(address(loan)), 0);
        assertTrue(loan.getPaidEarly());

        assertFalse(loan.canDoEarlyRepayment());
    }

    function testEarlyRepaymentRefusalEthEth() public {
        _testIssuanceEthEth();
        Loan loan = _testAcceptanceEthEth();

        assertTrue(loan.canRequestEarlyRepayment());
        (bool earlyRepaymentRequested,) = barry.call{ value: earlyRepayment }("");
        assertTrue(earlyRepaymentRequested);
        vm.prank(barry);
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();
        assertTrue(loan.canDoEarlyRepayment());
        vm.prank(barry);
        vm.expectCall(barry, earlyRepayment, emptyBytes);
        loan.rejectEarlyRepayment();
        assertFalse(loan.getRequestPaidEarly());
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();

        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();
    }

    function testEarlyRepaymentRefusalEthCoin() public {
        _testIssuanceEthCoin();
        Loan loan = _testAcceptanceEthCoin();

        (bool earlyRepaymentRequested,) = barry.call{ value: earlyRepayment }("");
        assertTrue(earlyRepaymentRequested);
        assertTrue(loan.canRequestEarlyRepayment());
        vm.prank(barry);
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();

        assertTrue(loan.canDoEarlyRepayment());
        vm.prank(barry);
        vm.expectCall(barry, earlyRepayment, emptyBytes);
        loan.rejectEarlyRepayment();
        assertFalse(loan.getRequestPaidEarly());
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();

        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();
    }

    function testEarlyRepaymentRefusalCoinEth() public {
        _testIssuanceCoinEth();
        Loan loan = _testAcceptanceCoinEth();

        oneCoin.mint(barry, earlyRepayment);
        assertTrue(loan.canRequestEarlyRepayment());
        vm.prank(barry);
        oneCoin.approve(address(loan), earlyRepayment);
        vm.prank(barry);
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        assertTrue(loan.canDoEarlyRepayment());
        assertEq(oneCoin.balanceOf(address(loan)), earlyRepayment);
        vm.prank(andrea);
        loan.rejectEarlyRepayment();
        assertFalse(loan.getRequestPaidEarly());
        assertEq(oneCoin.balanceOf(address(loan)), 0);
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();

        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();
    }

    function testEarlyRepaymentRefusalCoinCoin() public {
        _testIssuanceCoinCoin();
        Loan loan = _testAcceptanceCoinCoin();

        oneCoin.mint(barry, earlyRepayment);
        vm.prank(barry);
        oneCoin.approve(address(loan), earlyRepayment);
        assertTrue(loan.canRequestEarlyRepayment());
        vm.prank(barry);
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        assertTrue(loan.canDoEarlyRepayment());
        assertEq(oneCoin.balanceOf(address(loan)), earlyRepayment);
        vm.prank(andrea);
        loan.rejectEarlyRepayment();
        assertFalse(loan.getRequestPaidEarly());
        assertEq(oneCoin.balanceOf(address(loan)), 0);
        vm.expectRevert("There is no request for early repayment");
        loan.getRequestPaidEarlyAmount();

        vm.prank(andrea);
        vm.expectRevert("Early repayment not requested");
        loan.acceptEarlyRepayment();
    }
    
    function testRemoveLoan() public {
        _testIssuanceEthEth(1);
        _testIssuanceCoinCoin(2);
        _testIssuanceEthCoin(3);

        assertEq(lendingPlatform.getLoanOffersLength(), 3);

        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(1, 2);
        assertEq(loanOffers.length, 2);
        assertEq(loanOffers[0].id, 2);
        assertEq(loanOffers[1].id, 3);

        vm.prank(mallory);
        vm.expectRevert("Loan offer can only be removed by loan issuer");
        lendingPlatform.removeLoan(2);

        assertEq(oneCoin.balanceOf(address(lendingPlatform)), amount);
        vm.prank(andrea);
        lendingPlatform.removeLoan(2);
        assertEq(oneCoin.balanceOf(address(lendingPlatform)), 0);

        assertEq(lendingPlatform.getLoanOffersLength(), 2);

        vm.prank(andrea);
        vm.expectCall(andrea, amount, emptyBytes);
        lendingPlatform.removeLoan(1);

        assertEq(lendingPlatform.getLoanOffersLength(), 1);

        vm.prank(andrea);
        vm.expectCall(andrea, amount, emptyBytes);
        lendingPlatform.removeLoan(3);

        assertEq(lendingPlatform.getLoanOffersLength(), 0);

        vm.prank(address(lendingPlatform));
        (bool notOk,) = andrea.call{ value: 1 }("");
        assertFalse(notOk);
    }

    function testDefaultWithEarlyRepayment() public {
        (bool ok,) = barry.call{ value: earlyRepayment }("");
        assertTrue(ok);
        
        _testIssuanceEthEth();
        Loan loan = _testAcceptanceEthEth();

        assertTrue(loan.canRequestEarlyRepayment());
        vm.prank(barry);
        loan.requestEarlyRepaymentEth{ value: earlyRepayment }();

        vm.warp(defaultLimit);
        vm.prank(andrea);
        vm.expectCall(andrea, collateral, emptyBytes);
        vm.expectCall(barry, earlyRepayment, emptyBytes);
        loan.defaultOnLoan();
    }

    function testDefaultWithEarlyRepaymentWithCoins() public {
        _testIssuanceCoinCoin();
        Loan loan = _testAcceptanceCoinCoin();

        oneCoin.mint(barry, earlyRepayment);
        vm.prank(barry);
        bool ok = oneCoin.approve(address(loan), earlyRepayment);
        assertTrue(ok);
        assertTrue(loan.canRequestEarlyRepayment());
        vm.prank(barry);
        loan.requestEarlyRepaymentCoin(earlyRepayment);

        assertEq(oneCoin.balanceOf(address(loan)), earlyRepayment);
        assertEq(twoCoin.balanceOf(address(loan)), collateral);
        vm.warp(defaultLimit);
        vm.prank(andrea);
        loan.defaultOnLoan();

        assertEq(oneCoin.balanceOf(address(loan)), 0);
        assertEq(twoCoin.balanceOf(address(loan)), 0);
    }

    function testNotAllowedToTakeOutLoan() public {
        _testIssuanceEthEth(1);
        _testIssuanceCoinCoin(2);

        (bool ok,) = mallory.call{ value: collateral }("");
        assertTrue(ok);

        twoCoin.mint(mallory, collateral);

        bool ok2 = twoCoin.approve(address(lendingPlatform), collateral);
        assertTrue(ok2);

        vm.prank(mallory);
        vm.expectRevert("Loan limit exceeded");
        lendingPlatform.acceptLoan{ value: collateral }(1);

        vm.prank(mallory);
        vm.expectRevert("Loan limit exceeded");
        lendingPlatform.acceptLoan(2);

        (bool ok3,) = mallory.call{ value: loanFee }("");
        assertTrue(ok3);
        vm.prank(mallory);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        lendingPlatform.setLoanLimit(mallory, amount - 1, 1);

        (bool ok4,) = mallory.call{ value: loanFee }("");
        assertTrue(ok4);
        vm.prank(mallory);
        lendingPlatform.setLoanLimitRequest{ value: loanFee }(bytes("https://google.com"));

        lendingPlatform.setLoanLimit(mallory, amount - 1, oneCoin, 2);

        vm.prank(mallory);
        vm.expectRevert("Loan limit exceeded");
        lendingPlatform.acceptLoan{ value: collateral }(1);

        vm.prank(mallory);
        vm.expectRevert("Loan limit exceeded");
        lendingPlatform.acceptLoan(2);
    }
}

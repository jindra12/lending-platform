//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {LendingPlatform,LendingPlatFormStructs,LendingPlatformEvents} from "../src/LendingPlatform.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract OneCoin is ERC20("OneCoin", "one") {}

contract TwoCoin is ERC20("TwoCoin", "two") {}

contract LendingPlatformTest is Test,LendingPlatFormStructs,LendingPlatformEvents {
    LendingPlatform public lendingPlatform;
    OneCoin public oneCoin;
    TwoCoin public twoCoin;
    address public andrea;
    address public barry;
    address public mallory;

    function makeAccount(uint32 random, uint256 funds) internal returns(address) {
        string memory mnemonic = "test test test test test test test test test test test junk";
        uint256 privateKey = vm.deriveKey(mnemonic, random);
        address addr = vm.addr(privateKey);
        (bool ok,) = addr.call{ value: funds }("");
        assertEq(ok, true);
        return addr;
    }

    function setUp() public {
        lendingPlatform = new LendingPlatform();
        lendingPlatform.setLoanFee(100);
        andrea = makeAccount(1, 1000);
        barry = makeAccount(2, 500);
        mallory = makeAccount(3, 300);
    }

    function testIssuanceEthEth() public {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoan{ value: 500 }(1000, 500, 700, 100, 100);
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, true);
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, 500);
        assertEq(loanOffer.loanData.collateral.value, 100);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, true);
        assertEq(loanOffer.loanData.defaultLimit, 700);
        assertEq(loanOffer.loanData.interval, 500);
        assertEq(loanOffer.loanData.singlePayment, 100);
        assertEq(loanOffer.loanData.toBePaid, 1000);
    }

    function testIssuanceEthCoin() public {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoan{ value: 500 }(1000, 500, 700, 100, 100, oneCoin);
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, true);
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, 500);
        assertEq(loanOffer.loanData.collateral.value, 100);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, false);
        assertEq(address(loanOffer.loanData.collateral.collateralCoin), address(oneCoin));
        assertEq(loanOffer.loanData.defaultLimit, 700);
        assertEq(loanOffer.loanData.interval, 500);
        assertEq(loanOffer.loanData.singlePayment, 100);
        assertEq(loanOffer.loanData.toBePaid, 1000);
    }

    function testIssuanceCoinEth() public {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoan(500, 1000, 500, 700, 100, 100, oneCoin);
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, false);
        assertEq(address(loanOffer.coin), address(oneCoin));
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, 500);
        assertEq(loanOffer.loanData.collateral.value, 100);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, true);
        assertEq(loanOffer.loanData.defaultLimit, 700);
        assertEq(loanOffer.loanData.interval, 500);
        assertEq(loanOffer.loanData.singlePayment, 100);
        assertEq(loanOffer.loanData.toBePaid, 1000);
    }

    function testIssuanceCoinCoin() public {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(true, false, false, false, address(lendingPlatform));
        emit IssuedLoan(1);
        lendingPlatform.offerLoan(500, 1000, 500, 700, 100, 100, oneCoin, twoCoin);
        assertEq(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assertEq(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assertEq(loanOffer.isEth, false);
        assertEq(address(loanOffer.coin), address(oneCoin));
        assertEq(loanOffer.from, andrea);
        assertEq(loanOffer.id, 1);
        assertEq(loanOffer.loanData.amount, 500);
        assertEq(loanOffer.loanData.collateral.value, 100);
        assertEq(loanOffer.loanData.collateral.isCollateralEth, false);
        assertEq(address(loanOffer.loanData.collateral.collateralCoin), address(twoCoin));
        assertEq(loanOffer.loanData.defaultLimit, 700);
        assertEq(loanOffer.loanData.interval, 500);
        assertEq(loanOffer.loanData.singlePayment, 100);
        assertEq(loanOffer.loanData.toBePaid, 1000);
    }

    /*function testAcceptanceEthEth() public {

    }

    function testAcceptanceCoinEth() public {

    }

    function testAcceptanceEthCoin() public {

    }

    function testAcceptanceCoinCoin() public {

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

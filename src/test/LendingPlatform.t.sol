// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console,keccak256} from "forge-std/Test.sol";
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

    function setUp() public {
        lendingPlatform = new LendingPlatform();
        lendingPlatform.setLoanFee(100);
        andrea = vm.addr(keccak256(abi.encodePacked(0)));
        barry = vm.addr(keccak256(abi.encodePacked(1)));
        mallory = vm.addr(keccak256(abi.encodePacked(2)));
    }

    function test_Issuance_Eth_Eth() public {
        vm.prank(andrea);
        vm.warp(0);
        vm.expectEmit(checkTopic1, checkTopic2, checkTopic3, checkData);
        vm.expectEmit(true, false, false, 1);
        emit IssuedLoan(1);
        lendingPlatform.offerLoan{ value: 500 }(1000, 500, 700, 100, 100);
        assert(lendingPlatform.getLoanOffersLength(), 1);
        LoanOffer[] memory loanOffers = lendingPlatform.listLoanOffers(0, 1);
        assert(loanOffers.length, 1);
        LoanOffer memory loanOffer = loanOffers[0];
        assert(loanOffer.isEth, true);
        assert(loanOffer.from, andrea);
        assert(loanOffer.id, 1);
        assert(loanOffer.loanData.amount, 500);
        assert(loanOffer.loanData.collateral, 100);
        assert(loanOffer.loanData.defaultLimit, 700);
        assert(loanOffer.loanData.interval, 500);
        assert(loanOffer.loanData.singlePayment, 100);
        assert(loanOffer.loanData.toBePaid, 1000);
    }

    /*function test_Issuance_Eth_Coin() public {
        
    }

    function test_Issuance_Coin_Eth() public {
        
    }

    function test_Issuance_Coin_Coin() public {
        
    }

    function test_Acceptance_Eth_Eth() public {

    }

    function test_Acceptance_Coin_Eth() public {

    }

    function test_Acceptance_Eth_Coin() public {

    }

    function test_Acceptance_Coin_Coin() public {

    }

    function test_Payment_Eth_Eth() public {

    }

    function test_Payment_Eth_Coin() public {

    }

    function test_Payment_Coin_Eth() public {

    }

    function test_Payment_Coin_Coin() public {

    }

    function test_Default_Eth_Eth() public {

    }

    function test_Default_Eth_Coin() public {

    }

    function test_Default_Coin_Eth() public {

    }

    function test_Default_Coin_Coin() public {

    }

    function test_EarlyRepaiment() public {

    }

    function test_EarlyRepaiment_Refusal() public {

    }

    function test_EarlyRepaiment_Eth() public {

    }

    function test_EarlyRepaiment_Coin() public {

    }*/
}

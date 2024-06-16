// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {LendingPlatform} from "../src/LendingPlatform.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract OneCoin is ERC20("OneCoin", "one") {}

contract TwoCoin is ERC20("TwoCoin", "two") {}

contract LendingPlatformTest is Test {
    LendingPlatform public lendingPlatform;

    function setUp() public {
        lendingPlatform = new LendingPlatform();
    }

    function test_Issuance_Eth_Eth() public {
        
    }

    function test_Issuance_Eth_Coin() public {
        
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

    }
}

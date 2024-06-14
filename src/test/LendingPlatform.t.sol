// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {LendingPlatform} from "../src/LendingPlatform.sol";

contract LendingPlatformTest is Test {
    LendingPlatform public lendingPlatform;

    function setUp() public {
        lendingPlatform = new LendingPlatform();
        lendingPlatform.setNumber(0);
    }

    function test_Increment() public {
        
    }
}

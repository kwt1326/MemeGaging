// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MemeTipLoggerV2} from "../src/MemeTipLoggerV2.sol";

contract MemeTipLoggerV2Test is Test {
    MemeTipLoggerV2 public logger;
    address public owner;
    address public user1;
    address public user2;
    address payable public creator;

    event TippedWithNative(
        address indexed from,
        address indexed to,
        uint256 amount,
        string memexUserName,
        string memexUserNameTag,
        uint256 totalByCreator,
        uint256 totalByNative
    );

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        creator = payable(makeAddr("creator"));

        logger = new MemeTipLoggerV2(owner);

        // Give users some native coins
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function test_TipWithNative() public {
        uint256 tipAmount = 1 ether;
        string memory userName = "testUser";
        string memory userTag = "1234";

        uint256 creatorBalanceBefore = creator.balance;

        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit TippedWithNative(
            user1,
            creator,
            tipAmount,
            userName,
            userTag,
            tipAmount,
            tipAmount
        );
        logger.tipWithNative{value: tipAmount}(creator, userName, userTag);

        // Check creator received the tip
        assertEq(creator.balance, creatorBalanceBefore + tipAmount);

        // Check storage
        bytes32 key = logger.computeCreatorKey(userName, userTag);
        assertEq(logger.totalTipsByCreator(key), tipAmount);
        assertEq(logger.totalTipsByNative(), tipAmount);
    }

    function test_MultipleTips() public {
        string memory userName = "testUser";
        string memory userTag = "1234";

        // First tip
        vm.prank(user1);
        logger.tipWithNative{value: 1 ether}(creator, userName, userTag);

        // Second tip
        vm.prank(user2);
        logger.tipWithNative{value: 2 ether}(creator, userName, userTag);

        bytes32 key = logger.computeCreatorKey(userName, userTag);
        assertEq(logger.totalTipsByCreator(key), 3 ether);
        assertEq(logger.totalTipsByNative(), 3 ether);
        assertEq(creator.balance, 3 ether);
    }

    function test_RevertWhenPaused() public {
        logger.pause();

        vm.prank(user1);
        vm.expectRevert();
        logger.tipWithNative{value: 1 ether}(creator, "user", "tag");
    }

    function test_RevertWhenZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert("NO_TIP");
        logger.tipWithNative{value: 0}(creator, "user", "tag");
    }

    function test_RevertWhenInvalidRecipient() public {
        vm.prank(user1);
        vm.expectRevert("INVALID_RECIPIENT");
        logger.tipWithNative{value: 1 ether}(payable(address(0)), "user", "tag");
    }

    function test_Withdraw() public {
        // Send some native coins to contract
        vm.deal(address(logger), 10 ether);

        address payable recipient = payable(makeAddr("recipient"));
        uint256 recipientBalanceBefore = recipient.balance;
        
        logger.withdraw(recipient, 5 ether);

        assertEq(recipient.balance, recipientBalanceBefore + 5 ether);
        assertEq(address(logger).balance, 5 ether);
    }

    function test_RevertWithdrawNonOwner() public {
        vm.deal(address(logger), 10 ether);

        vm.prank(user1);
        vm.expectRevert();
        logger.withdraw(payable(user1), 5 ether);
    }
}

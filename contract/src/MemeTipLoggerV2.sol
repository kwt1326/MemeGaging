// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {LibString} from "solady/utils/LibString.sol";

contract MemeTipLoggerV2 is Ownable, Pausable, ReentrancyGuard {
    event TippedWithNative(
        address indexed from,
        address indexed to,
        uint256 amount,
        string memexUserName,
        string memexUserNameTag,
        uint256 totalByCreator,
        uint256 totalByNative
    );

    mapping(bytes32 => uint256) public totalTipsByCreator;

    uint256 public totalTipsByNative;

    constructor(address _initialOwner) Ownable(_initialOwner) {
        require(_initialOwner != address(0), "Invalid operator");
        _transferOwnership(_initialOwner);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "INVALID_RECIPIENT");
        require(amount <= address(this).balance, "INSUFFICIENT_BALANCE");
        (bool success, ) = to.call{value: amount}("");
        require(success, "TRANSFER_FAILED");
    }

    function computeCreatorKey(
        string memory memexUserName,
        string memory memexUserNameTag
    ) public pure returns (bytes32) {
        bytes32 packed = LibString.packTwo(memexUserName, memexUserNameTag);
        
        if (packed == bytes32(0)) {
            return keccak256(abi.encodePacked(memexUserName, memexUserNameTag));
        }
        
        return packed;
    }

    function tipWithNative(
        address payable to,
        string calldata memexUserName,
        string calldata memexUserNameTag
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "NO_TIP");
        require(to != address(0), "INVALID_RECIPIENT");

        (bool success, ) = to.call{value: msg.value}("");
        require(success, "TRANSFER_FAILED");

        bytes32 key = computeCreatorKey(memexUserName, memexUserNameTag);
        totalTipsByCreator[key] += msg.value;
        uint256 newTotalByCreator = totalTipsByCreator[key];

        totalTipsByNative += msg.value;
        uint256 newTotalByNative = totalTipsByNative;

        emit TippedWithNative(
            msg.sender,
            to,
            msg.value,
            memexUserName,
            memexUserNameTag,
            newTotalByCreator,
            newTotalByNative
        );
    }

    receive() external payable {}
}

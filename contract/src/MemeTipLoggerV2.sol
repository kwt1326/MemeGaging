// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {LibString} from "solady/utils/LibString.sol";

/// @title MemeTipLoggerV2
/// @notice 네이티브 코인(M)으로 크리에이터에게 Tip을 보내는 컨트랙트
/// @dev 토큰 대신 네이티브 코인을 사용하여 Tip 기록을 남김
contract MemeTipLoggerV2 is Ownable, Pausable, ReentrancyGuard {
    /// @notice Tip 발생 시 로그
    /// @param from  Tip을 보낸 지갑 주소
    /// @param to    Tip을 받은 지갑 주소 (크리에이터 지갑)
    /// @param amount 전송된 네이티브 코인 양 (wei)
    /// @param memexUserName   MemeX 상의 유저 네임
    /// @param memexUserNameTag MemeX 상의 태그 (빈 문자열 가능)
    /// @param totalByCreator 크리에이터별 누적 Tip 양
    /// @param totalByNative 네이티브 코인 총 누적 Tip 양
    event TippedWithNative(
        address indexed from,
        address indexed to,
        uint256 amount,
        string memexUserName,
        string memexUserNameTag,
        uint256 totalByCreator,
        uint256 totalByNative
    );

    /// @dev key = keccak256(abi.encodePacked(memexUserName, memexUserNameTag))
    mapping(bytes32 => uint256) public totalTipsByCreator;

    /// @notice 네이티브 코인 전체 Tip 누적
    uint256 public totalTipsByNative;

    constructor(address _initialOwner) Ownable(_initialOwner) {
        require(_initialOwner != address(0), "Invalid operator");
        _transferOwnership(_initialOwner);
    }

    // ============= Admin =============

    /// @notice Tip 기능 일시 정지
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Tip 기능 재개
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice 컨트랙트에 쌓인 네이티브 코인 인출 (긴급용)
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "INVALID_RECIPIENT");
        require(amount <= address(this).balance, "INSUFFICIENT_BALANCE");
        (bool success, ) = to.call{value: amount}("");
        require(success, "TRANSFER_FAILED");
    }

    // ============= View Helper =============

    /// @notice 크리에이터별 고유 key 계산 (Solady 최적화)
    /// @dev LibString.packTwo를 사용하여 가스 효율적으로 패킹
    function computeCreatorKey(
        string memory memexUserName,
        string memory memexUserNameTag
    ) public pure returns (bytes32) {
        // Solady의 packTwo를 사용하여 두 문자열을 32바이트로 패킹
        // userName과 tag가 짧으면 효율적으로 패킹됨
        bytes32 packed = LibString.packTwo(memexUserName, memexUserNameTag);
        
        // packTwo가 실패하면 bytes32(0)을 반환하므로 fallback
        if (packed == bytes32(0)) {
            return keccak256(abi.encodePacked(memexUserName, memexUserNameTag));
        }
        
        return packed;
    }

    // ============= Main Logic =============

    /// @notice 네이티브 코인으로 Tip 보내기
    /// @dev msg.value를 크리에이터에게 전송하고 로그 기록
    function tipWithNative(
        address payable to,
        string calldata memexUserName,
        string calldata memexUserNameTag
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "NO_TIP");
        require(to != address(0), "INVALID_RECIPIENT");

        // 1) 네이티브 코인 전송 (from: msg.sender, to: 크리에이터 지갑)
        (bool success, ) = to.call{value: msg.value}("");
        require(success, "TRANSFER_FAILED");

        // 2) 크리에이터 기준 누적값 업데이트
        bytes32 key = computeCreatorKey(memexUserName, memexUserNameTag);
        totalTipsByCreator[key] += msg.value;
        uint256 newTotalByCreator = totalTipsByCreator[key];

        // 3) 네이티브 코인 전체 누적값도 저장
        totalTipsByNative += msg.value;
        uint256 newTotalByNative = totalTipsByNative;

        // 4) 이벤트 로깅 (누적값 포함)
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

    /// @notice 컨트랙트가 네이티브 코인을 받을 수 있도록 함
    receive() external payable {}
}

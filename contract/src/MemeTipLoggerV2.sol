// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {EfficientHashLib} from "solady/utils/EfficientHashLib.sol";
import {LibString} from "solady/utils/LibString.sol";

/// @title MemeTipLoggerV2
/// @notice "크리에이터 토큰"으로 상대에게 토큰을 보내면서 온체인 Tip 기록을 남기는 컨트랙트
/// @dev
/// - 사용 전: 크리에이터 토큰 컨트랙트에서 `approve(this, amount)` 가 선행되어야 함
/// - 이 컨트랙트는 토큰을 보관하지 않고, 전송만 중계하고 로그/누적값만 기록
contract MemeTipLoggerV2 is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Tip 발생 시 로그
    /// @param from  Tip을 보낸 지갑 주소
    /// @param to    Tip을 받은 지갑 주소 (크리에이터 지갑)
    /// @param token 사용된 크리에이터 토큰 주소
    /// @param amount 전송된 토큰 양
    /// @param memexUserName   MemeX 상의 유저 네임 (예: "zIfjpicANr")
    /// @param memexUserNameTag MemeX 상의 태그 (예: "e93cD9" 또는 빈 문자열)
    event TippedWithToken(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        string memexUserName,
        string memexUserNameTag
    );

    event TokenAllowedUpdated(address indexed token, bool allowed);

    /// @notice 허용된 크리에이터 토큰만 사용하도록 화이트리스트
    mapping(address => bool) public allowedTokens;

    /// @dev key = keccak256(abi.encodePacked(token, memexUserName, "#", memexUserNameTag))
    mapping(bytes32 => uint256) public totalTipsByCreator;

    /// @notice 토큰 주소별 전체 Tip 누적
    mapping(address => uint256) public totalTipsByToken;

    constructor(address _initialOwner) Ownable(_initialOwner) {
        require(_initialOwner != address(0), "Invalid operator");
        _transferOwnership(_initialOwner);
    }

    // ============= Admin =============

    /// @notice 허용된 크리에이터 토큰만 사용하도록 화이트리스트 관리
    function setAllowedToken(address token, bool allowed) external onlyOwner {
        require(token != address(0), "INVALID_TOKEN");
        allowedTokens[token] = allowed;
        emit TokenAllowedUpdated(token, allowed);
    }

    /// @notice Tip 기능 일시 정지
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Tip 기능 재개
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============= View Helper =============

    /// @notice 크리에이터별 고유 key 계산 (오프체인/백엔드 참고용)
    function computeCreatorKey(
        address token,
        string memory memexUserName,
        string memory memexUserNameTag
    ) public pure returns (bytes32) {
        // 1) userName + tag 를 32바이트로 패킹
        //    - LibString.packTwo 는 둘 다 7-bit ASCII, 전체가 32바이트 이하면 OK
        //    - 너무 길면 bytes32(0) 리턴 (handle / tag는 짧으니 실사용 문제 거의 없음)
        bytes32 packedName = LibString.packTwo(memexUserName, memexUserNameTag);

        // 2) token 주소를 bytes32 로 올리기
        bytes32 tokenWord = bytes32(uint256(uint160(token)));

        // 3) EfficientHashLib 로 (token, packedName) 해시
        //    => keccak256(abi.encode(tokenWord, packedName)) 과 동등한 효과
        return EfficientHashLib.hash(tokenWord, packedName);
    }

    // ============= Main Logic =============

    /// @notice 크리에이터 토큰으로 Tip 보내기
    /// @dev
    /// - 호출 전: IERC20(token).approve(address(this), amount) 필요
    /// - SafeERC20 사용해서 비표준 ERC20도 최대한 안전하게 처리
    function tipWithToken(
        address token,
        address to,
        uint256 amount,
        string calldata memexUserName,
        string calldata memexUserNameTag
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "NO_TIP");
        require(to != address(0), "INVALID_RECIPIENT");
        require(token != address(0), "INVALID_TOKEN");
        require(allowedTokens[token], "TOKEN_NOT_ALLOWED");

        // 1) 토큰 전송 (from: msg.sender, to: 크리에이터 지갑)
        IERC20(token).safeTransferFrom(msg.sender, to, amount);

        // 2) 크리에이터 기준 누적값 업데이트
        bytes32 key = computeCreatorKey(token, memexUserName, memexUserNameTag);
        totalTipsByCreator[key] += amount;

        // 3) 토큰 주소 기준 전체 누적값도 저장
        totalTipsByToken[token] += amount;

        // 4) 이벤트 로깅
        emit TippedWithToken(
            msg.sender,
            to,
            token,
            amount,
            memexUserName,
            memexUserNameTag
        );
    }
}

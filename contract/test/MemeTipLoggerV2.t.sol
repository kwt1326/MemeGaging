// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MemeTipLoggerV2} from "../src/MemeTipLoggerV2.sol";

error EnforcedPause();
error ReentrancyGuardReentrantCall();
error OwnableUnauthorizedAccount(address);

/// @notice 심플 ERC20 구현 (테스트용)
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public immutable DECIMALS = 18;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "ALLOWANCE");
        uint256 bal = _balances[from];
        require(bal >= amount, "BALANCE");

        _allowances[from][msg.sender] = allowed - amount;
        _balances[from] = bal - amount;
        _balances[to] += amount;

        return true;
    }
}

/// @notice ReentrancyGuard가 잘 동작하는지 확인하기 위한 악성 토큰
contract MaliciousToken is MockERC20 {
    MemeTipLoggerV2 public logger;
    address public victimCreator;
    bool internal _reentering;

    constructor(MemeTipLoggerV2 _logger)
        MockERC20("Malicious", "MAL")
    {
        logger = _logger;
    }

    /// @dev transferFrom 도중에 re-enter 를 시도
    function setVictimCreator(address _creator) external {
        victimCreator = _creator;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        bool ok = super.transferFrom(from, to, amount);
        require(ok, "TRANSFER_FAIL");

        if (!_reentering) {
            _reentering = true;
            // 여기서 re-enter 시도 → ReentrancyGuard 가 막아야 함
            logger.tipWithToken(
                address(this),
                victimCreator,
                1,
                "malicious",
                "reenter"
            );
            _reentering = false;
        }

        return true;
    }
}

contract MemeTipLoggerV2Test is Test {
    MemeTipLoggerV2 public logger;
    MockERC20 public creatorToken;
    MaliciousToken public maliciousToken;

    address public owner = address(0xA11CE);
    address public alice = address(0xB0B);
    address public bob   = address(0xC0C); // 크리에이터 지갑으로 가정

    function setUp() public {
        vm.startPrank(owner);
        logger = new MemeTipLoggerV2(owner);
        creatorToken = new MockERC20("CreatorToken", "CRT");
        maliciousToken = new MaliciousToken(logger);

        // 크리에이터 토큰 화이트리스트 등록
        logger.setAllowedToken(address(creatorToken), true);
        vm.stopPrank();

        // alice 에게 토큰 민팅
        creatorToken.mint(alice, 1_000 ether);
        maliciousToken.mint(alice, 1_000 ether);
    }

    // ============ 기본 성공 케이스 ============

    function testTipWithTokenSuccess() public {
        // alice 가 logger 에게 approve
        vm.startPrank(alice);
        creatorToken.approve(address(logger), 100 ether);

        // tip
        logger.tipWithToken(
            address(creatorToken),
            bob,
            10 ether,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();

        // 밸런스 체크
        uint256 aliceBal = creatorToken.balanceOf(alice);
        uint256 bobBal = creatorToken.balanceOf(bob);

        assertEq(aliceBal, 1_000 ether - 10 ether, "alice balance");
        assertEq(bobBal, 10 ether, "bob balance");

        // 누적 메트릭 체크
        bytes32 key = logger.computeCreatorKey(
            address(creatorToken),
            "alice_user",
            "tag123"
        );

        assertEq(
            logger.totalTipsByCreator(key),
            10 ether,
            "totalTipsByCreator"
        );
        assertEq(
            logger.totalTipsByToken(address(creatorToken)),
            10 ether,
            "totalTipsByToken"
        );
    }

    // ============ 실패 케이스: 화이트리스트 미등록 토큰 ============

    function testRevertWhenTokenNotAllowed() public {
        // maliciousToken 은 allowedTokens 에 등록 안 함

        vm.startPrank(alice);
        maliciousToken.approve(address(logger), 1 ether);

        vm.expectRevert(bytes("TOKEN_NOT_ALLOWED"));
        logger.tipWithToken(
            address(maliciousToken),
            bob,
            1 ether,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();
    }

    // ============ 실패 케이스: amount == 0 ============

    function testRevertWhenAmountZero() public {
        vm.startPrank(alice);
        creatorToken.approve(address(logger), 0);

        vm.expectRevert(bytes("NO_TIP"));
        logger.tipWithToken(
            address(creatorToken),
            bob,
            0,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();
    }

    // ============ 실패 케이스: recipient == address(0) ============

    function testRevertWhenRecipientZero() public {
        vm.startPrank(alice);
        creatorToken.approve(address(logger), 1 ether);

        vm.expectRevert(bytes("INVALID_RECIPIENT"));
        logger.tipWithToken(
            address(creatorToken),
            address(0),
            1 ether,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();
    }

    // ============ 실패 케이스: token == address(0) ============

    function testRevertWhenTokenZero() public {
        vm.startPrank(alice);

        vm.expectRevert(bytes("INVALID_TOKEN"));
        logger.tipWithToken(
            address(0),
            bob,
            1 ether,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();
    }

    // ============ Pausable: pause/unpause ============

    function testPauseAndUnpause() public {
        // owner 가 pause
        vm.prank(owner);
        logger.pause();

        vm.startPrank(alice);
        creatorToken.approve(address(logger), 1 ether);

        vm.expectRevert(EnforcedPause.selector);
        logger.tipWithToken(
            address(creatorToken),
            bob,
            1 ether,
            "alice_user",
            "tag123"
        );

        vm.stopPrank();

        // unpause 후에는 정상 동작
        vm.prank(owner);
        logger.unpause();

        vm.startPrank(alice);
        logger.tipWithToken(
            address(creatorToken),
            bob,
            1 ether,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();

        assertEq(creatorToken.balanceOf(bob), 1 ether);
    }

    // ============ Ownable: setAllowedToken 권한 체크 ============

    function testSetAllowedTokenOnlyOwner() public {
        address rando = address(0xDEAD);

        vm.prank(rando);
        // OwnableUnauthorizedAccount(rando) 커스텀 에러 기대
        vm.expectRevert(
            abi.encodeWithSelector(OwnableUnauthorizedAccount.selector, rando)
        );
        logger.setAllowedToken(address(maliciousToken), true);
    }

    // ============ Reentrancy 방어 테스트 ============

    function testReentrancyGuardBlocksReenter() public {
        // 악성 토큰을 allowedTokens 에 등록
        vm.prank(owner);
        logger.setAllowedToken(address(maliciousToken), true);

        // 공격자 설정
        maliciousToken.setVictimCreator(bob);
        maliciousToken.mint(alice, 100 ether);

        vm.startPrank(alice);
        maliciousToken.approve(address(logger), 100 ether);

        // 첫 tipWithToken 호출 도중, maliciousToken.transferFrom 내부에서
        // logger.tipWithToken 을 다시 호출하려고 함 → ReentrancyGuard 가 막아야 함
        vm.expectRevert(ReentrancyGuardReentrantCall.selector);
        logger.tipWithToken(
            address(maliciousToken),
            bob,
            10 ether,
            "alice_user",
            "tag123"
        );
        vm.stopPrank();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {MemeTipLoggerV2} from "../src/MemeTipLoggerV2.sol";

/// @dev OWNER_PRIVATE_KEY, OWNER_ADDRESS, RPC_URL 등 환경 변수와 함께 사용

contract MemeTipLoggerV2Deploy is Script {
    function run() external {
        // 1. 배포자(= owner) 프라이빗키 & 주소 로드
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address ownerAddress = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 2. 컨트랙트 배포
        MemeTipLoggerV2 logger = new MemeTipLoggerV2(ownerAddress);

        vm.stopBroadcast();

        console2.log("MemeTipLoggerV2 deployed at:", address(logger));
        console2.log("Owner:", ownerAddress);
        console2.log("");
        console2.log("To verify the contract, run:");
        console2.log("forge verify-contract", address(logger), "src/MemeTipLoggerV2.sol:MemeTipLoggerV2");
        console2.log("  --rpc-url https://rpc.insectarium.memecore.net");
        console2.log("  --verifier blockscout");
        console2.log("  --verifier-url <EXPLORER_API_URL>");
        console2.log("  --constructor-args $(cast abi-encode 'constructor(address)' ", ownerAddress, ")");
    }
}

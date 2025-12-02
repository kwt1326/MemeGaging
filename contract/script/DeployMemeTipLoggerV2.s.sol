// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {MemeTipLoggerV2} from "../src/MemeTipLoggerV2.sol";

/// @dev OWNER_PRIVATE_KEY, OWNER_ADDRESS, RPC_URL 등 환경 변수와 함께 사용

contract MemeTipLoggerV2Deploy is Script {
    function run() external {
        // 1. 배포자(= owner) 프라이빗키 & 주소 로드
        //    - PRIVATE_KEY 는 배포에 사용할 EOA의 키
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address ownerAddress = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 2. 컨트랙트 배포
        MemeTipLoggerV2 logger = new MemeTipLoggerV2(ownerAddress);

        vm.stopBroadcast();

        console2.log("MemeTipLoggerV2 deployed at:", address(logger));
        console2.log("Owner:", ownerAddress);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcPredixTypes.sol";
import "../src/ArcPredixMarket.sol";
import "../src/ArcPredixMarketFactory.sol";
import "../src/ArcPredixAgentRegistry.sol";
import "../src/ArcPredixJobBoard.sol";
import "../src/ArcPredixNanoStreamer.sol";

contract DeployArcPredix is Script {

    // Arc Testnet USDC
    // Update setelah cek: https://docs.arc.network/arc/references/contract-addresses
    address constant ARC_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console.log("=== ArcPredix Protocol Deployment ===");
        console.log("Deployer:     ", deployer);
        console.log("Chain ID:      5042002 (Arc Testnet)");
        console.log("USDC Address: ", ARC_USDC);
        console.log("");

        vm.startBroadcast(deployerKey);

        // 1. Deploy Agent Registry
        ArcPredixAgentRegistry registry = new ArcPredixAgentRegistry(ARC_USDC);
        console.log("ArcPredixAgentRegistry:", address(registry));

        // 2. Deploy Market Factory
        ArcPredixMarketFactory factory = new ArcPredixMarketFactory(ARC_USDC, deployer);
        console.log("ArcPredixMarketFactory:", address(factory));

        // 3. Deploy Job Board
        ArcPredixJobBoard jobBoard = new ArcPredixJobBoard(ARC_USDC, address(registry));
        console.log("ArcPredixJobBoard:     ", address(jobBoard));

        // 4. Deploy Nano Streamer
        ArcPredixNanoStreamer streamer = new ArcPredixNanoStreamer(ARC_USDC);
        console.log("ArcPredixNanoStreamer: ", address(streamer));

        // 5. Wire permissions
        registry.setAuthorizedCaller(address(jobBoard), true);
        console.log("JobBoard authorized on Registry");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Simpan ke .env:");
        console.log("REGISTRY_ADDRESS=", address(registry));
        console.log("FACTORY_ADDRESS= ", address(factory));
        console.log("JOBBOARD_ADDRESS=", address(jobBoard));
        console.log("STREAMER_ADDRESS=", address(streamer));
    }
}

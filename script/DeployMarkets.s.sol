// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcPredixTypes.sol";
import "../src/ArcPredixMarketFactory.sol";

contract DeployMarkets is Script {
    address constant USDC    = 0x3600000000000000000000000000000000000000;
    address constant FACTORY = 0x15E45A2776c2E455c5425f8E2B86cD1493dB47b8;

    function run() external {
        uint256 key  = vm.envUint("PRIVATE_KEY");
        address self = vm.addr(key);

        vm.startBroadcast(key);

        IUSDC(USDC).approve(FACTORY, 10_000_000);

        string[5] memory questions = [
            "Will ETH exceed $5000 before July 2026?",
            "Will Arc Mainnet launch before Q4 2026?",
            "Will USDC market cap exceed $100B in 2026?",
            "Will Circle go public before end of 2026?",
            "Will Bitcoin ETF AUM exceed $200B in 2026?"
        ];

        uint256[5] memory yesOdds = [uint256(42), 78, 51, 61, 44];

        for (uint i = 0; i < 5; i++) {
            MarketConfig memory cfg = MarketConfig({
                question:         questions[i],
                resolutionTime:   1779240313,
                expiryTime:       1779326713,
                oracle:           self,
                initialLiquidity: 100,
                feeBps:           50
            });
            (, address market) = ArcPredixMarketFactory(FACTORY).createMarket(cfg, 100);
            console.log("Market", i + 2, ":", market);
        }

        vm.stopBroadcast();
    }
}

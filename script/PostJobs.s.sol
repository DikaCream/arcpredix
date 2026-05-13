// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcPredixTypes.sol";

interface IJobBoard {
    function postJob(address market, uint256 requiredLiquidity, uint256 durationSeconds, uint256 payment, uint256 minReputation) external returns (uint256);
}

interface IUSDC2 {
    function approve(address spender, uint256 amount) external returns (bool);
}

contract PostJobs is Script {
    address constant USDC     = 0x3600000000000000000000000000000000000000;
    address constant JOBBOARD = 0xb0E527C4328CeacB1e91cBFe6dDe86c86C1c59B7;

    address[6] markets = [
        0xB0b51dA95d5D2D4A426a10Bc908F1C8d90ce0403,
        0xBeAF4B67F9499f6BF6a7c6542997E68458092c8A,
        0x4a6c75207D74A1D72D2D340163812110d0baCC5D,
        0xba2c4423004EAD5658Eb233c08a769277582aE19,
        0xf4bBc8942872eCc6D96f92f4708c778082dAad0C,
        0x3347C1F4d129678Cf1e997034abB59465A94CD5C
    ];

    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        IUSDC2(USDC).approve(JOBBOARD, 6000000);

        for (uint i = 0; i < 6; i++) {
            uint256 jobId = IJobBoard(JOBBOARD).postJob(
                markets[i],
                1000000,
                3600,
                500000,
                0
            );
            console.log("Job", jobId, "posted for market", i+1);
        }

        vm.stopBroadcast();
    }
}

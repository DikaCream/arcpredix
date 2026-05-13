// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Script.sol";

interface IJobTracker {
    function postJob(address market, uint256 liq, uint256 dur, uint256 pay, uint256 minRep) external returns (uint256);
}

contract PostJobsTracker is Script {
    address constant TRACKER = 0xD5cabC8A781d5d0970208485ea1D35bE3c2570fF;
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
        for (uint i = 0; i < 6; i++) {
            uint256 id = IJobTracker(TRACKER).postJob(
                markets[i],
                1000000,
                3600 * (i + 1),
                500000,
                i * 500
            );
            console.log("Job", id, "posted");
        }
        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Script.sol";
import "../src/ArcPredixJobTracker.sol";

contract DeployJobTracker is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        ArcPredixJobTracker jt = new ArcPredixJobTracker();
        console.log("JobTracker:", address(jt));
        vm.stopBroadcast();
    }
}

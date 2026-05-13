// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Script.sol";
import "../src/ArcPredixJobBoard.sol";
contract DeployJobBoard is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        address registry = 0x30E46508258Eb7c76fd0116EE94eBfAf9F8BC9c3;
        ArcPredixJobBoard jb = new ArcPredixJobBoard(
            0x3600000000000000000000000000000000000000,
            registry
        );
        console.log("JobBoard:", address(jb));
        vm.stopBroadcast();
    }
}

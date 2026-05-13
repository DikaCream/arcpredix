// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract ArcPredixJobTracker {
    struct Job {
        uint256 id;
        address poster;
        address market;
        uint256 liquidityAmount;
        uint256 durationSeconds;
        uint256 payment;
        uint256 minReputation;
        address assignedAgent;
        uint8 status; // 0=open 1=accepted 2=completed 3=cancelled
        uint256 postedAt;
    }

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public agentJobs;
    mapping(address => uint256[]) public marketJobs;

    event JobPosted(uint256 indexed id, address indexed poster, address indexed market, uint256 payment);
    event JobAccepted(uint256 indexed id, address indexed agent);
    event JobCompleted(uint256 indexed id, address indexed agent);

    function postJob(address market, uint256 liq, uint256 dur, uint256 pay, uint256 minRep)
        external returns (uint256)
    {
        require(market != address(0), "invalid market");
        require(pay > 0, "payment required");
        jobCount++;
        jobs[jobCount] = Job(jobCount, msg.sender, market, liq, dur, pay, minRep,
                             address(0), 0, block.timestamp);
        marketJobs[market].push(jobCount);
        emit JobPosted(jobCount, msg.sender, market, pay);
        return jobCount;
    }

    function acceptJob(uint256 id) external {
        require(jobs[id].status == 0, "not open");
        jobs[id].assignedAgent = msg.sender;
        jobs[id].status = 1;
        agentJobs[msg.sender].push(id);
        emit JobAccepted(id, msg.sender);
    }

    function completeJob(uint256 id) external {
        require(jobs[id].status == 1, "not accepted");
        require(jobs[id].assignedAgent == msg.sender, "not agent");
        jobs[id].status = 2;
        emit JobCompleted(id, msg.sender);
    }

    function cancelJob(uint256 id) external {
        require(jobs[id].poster == msg.sender, "not poster");
        require(jobs[id].status == 0, "not open");
        jobs[id].status = 3;
    }

    function getJob(uint256 id) external view returns (Job memory) { return jobs[id]; }
    function getMarketJobs(address market) external view returns (uint256[] memory) { return marketJobs[market]; }
    function getAgentJobs(address agent) external view returns (uint256[] memory) { return agentJobs[agent]; }
}

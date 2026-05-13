// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ArcPredixTypes.sol";
import "./ArcPredixMarket.sol";
import "./ArcPredixAgentRegistry.sol";

contract ArcPredixJobBoard {

    uint256 public constant MIN_JOB_DURATION  = 1 hours;
    uint256 public constant MAX_JOB_DURATION  = 30 days;
    uint256 public constant COMPLETION_WINDOW = 1 hours;
    uint256 public constant DISPUTE_WINDOW    = 24 hours;

    IUSDC                    public immutable usdc;
    ArcPredixAgentRegistry   public immutable registry;
    address                  public           owner;

    uint256 public jobCount;

    mapping(uint256 => LiquidityJob)  public jobs;
    mapping(address => uint256[])     public agentJobs;
    mapping(address => uint256[])     public marketJobs;
    mapping(uint256 => uint256)       public jobLpSharesAtAcceptance;

    event JobPosted(
        uint256 indexed jobId,
        address indexed poster,
        address indexed market,
        uint256         requiredLiquidity,
        uint256         durationSeconds,
        uint256         payment,
        uint256         minReputation
    );
    event JobAccepted(uint256 indexed jobId, address indexed agent, uint256 timestamp);
    event JobCompleted(uint256 indexed jobId, address indexed agent, uint256 payment, uint256 timestamp);
    event JobCancelled(uint256 indexed jobId, address indexed cancelledBy, string reason);
    event JobDisputed(uint256 indexed jobId, address indexed disputedBy);

    constructor(address _usdc, address _registry) {
        usdc     = IUSDC(_usdc);
        registry = ArcPredixAgentRegistry(_registry);
        owner    = msg.sender;
    }

    function postJob(
        address market,
        uint256 requiredLiquidity,
        uint256 durationSeconds,
        uint256 payment,
        uint256 minReputation
    ) external returns (uint256 jobId) {
        if (market == address(0))               revert ZeroAmount();
        if (requiredLiquidity == 0)             revert ZeroAmount();
        if (payment == 0)                       revert ZeroAmount();
        if (durationSeconds < MIN_JOB_DURATION) revert DeadlineNotReached();
        if (durationSeconds > MAX_JOB_DURATION) revert MarketExpired();

        if (!usdc.transferFrom(msg.sender, address(this), payment))
            revert TransferFailed();

        jobId = ++jobCount;

        jobs[jobId] = LiquidityJob({
            id:                jobId,
            poster:            msg.sender,
            market:            market,
            requiredLiquidity: requiredLiquidity,
            durationSeconds:   durationSeconds,
            payment:           payment,
            minReputation:     minReputation,
            assignedAgent:     address(0),
            status:            JobStatus.OPEN,
            postedAt:          block.timestamp,
            acceptedAt:        0,
            completedAt:       0
        });

        marketJobs[market].push(jobId);

        emit JobPosted(
            jobId,
            msg.sender,
            market,
            requiredLiquidity,
            durationSeconds,
            payment,
            minReputation
        );
    }

    function acceptJob(uint256 jobId) external {
        LiquidityJob storage job = jobs[jobId];

        if (job.id == 0)                    revert ZeroAmount();
        if (job.status != JobStatus.OPEN)   revert JobNotOpen();
        if (!registry.isActive(msg.sender)) revert AgentNotActive();

        uint256 agentRep = registry.getReputationScore(msg.sender);
        if (agentRep < job.minReputation)   revert InsufficientReputation();

        ArcPredixMarket market = ArcPredixMarket(job.market);

        if (!usdc.transferFrom(msg.sender, address(this), job.requiredLiquidity))
            revert TransferFailed();

        if (!usdc.approve(job.market, job.requiredLiquidity))
            revert TransferFailed();

        uint256 lpSharesMinted = market.addLiquidity(job.requiredLiquidity);

        jobLpSharesAtAcceptance[jobId] = lpSharesMinted;

        job.assignedAgent = msg.sender;
        job.status        = JobStatus.ACCEPTED;
        job.acceptedAt    = block.timestamp;

        agentJobs[msg.sender].push(jobId);

        emit JobAccepted(jobId, msg.sender, block.timestamp);
    }

    function completeJob(uint256 jobId) external {
        LiquidityJob storage job = jobs[jobId];

        if (job.status != JobStatus.ACCEPTED) revert JobNotAccepted();
        if (job.assignedAgent != msg.sender)  revert Unauthorized();

        uint256 deadline = job.acceptedAt + job.durationSeconds;
        if (block.timestamp < deadline)       revert DeadlineNotReached();

        ArcPredixMarket market  = ArcPredixMarket(job.market);
        uint256 lpShares         = jobLpSharesAtAcceptance[jobId];
        uint256 usdcReturned     = market.removeLiquidity(lpShares);

        if (!usdc.transfer(msg.sender, usdcReturned)) revert TransferFailed();
        if (!usdc.transfer(msg.sender, job.payment))  revert TransferFailed();

        job.status      = JobStatus.COMPLETED;
        job.completedAt = block.timestamp;

        registry.recordJobCompletion(msg.sender, job.requiredLiquidity);

        emit JobCompleted(jobId, msg.sender, job.payment, block.timestamp);
    }

    function cancelJob(uint256 jobId) external {
        LiquidityJob storage job = jobs[jobId];

        if (job.status != JobStatus.OPEN) revert JobNotOpen();
        if (job.poster != msg.sender)     revert Unauthorized();

        job.status = JobStatus.CANCELLED;

        if (!usdc.transfer(msg.sender, job.payment)) revert TransferFailed();

        emit JobCancelled(jobId, msg.sender, "poster_cancelled");
    }

    function cancelAbandonedJob(uint256 jobId) external {
        LiquidityJob storage job = jobs[jobId];

        if (job.status != JobStatus.ACCEPTED) revert JobNotAccepted();

        uint256 expiry = job.acceptedAt + job.durationSeconds + COMPLETION_WINDOW;
        if (block.timestamp < expiry) revert DeadlineNotReached();

        address abandonedAgent = job.assignedAgent;
        job.status = JobStatus.CANCELLED;

        registry.recordJobFailure(abandonedAgent);

        if (!usdc.transfer(job.poster, job.payment)) revert TransferFailed();

        emit JobCancelled(jobId, msg.sender, "agent_abandoned");
    }

    function getJob(uint256 jobId)
        external view returns (LiquidityJob memory)
    {
        return jobs[jobId];
    }

    function getAgentJobs(address agent)
        external view returns (uint256[] memory)
    {
        return agentJobs[agent];
    }

    function getMarketJobs(address market)
        external view returns (uint256[] memory)
    {
        return marketJobs[market];
    }
}

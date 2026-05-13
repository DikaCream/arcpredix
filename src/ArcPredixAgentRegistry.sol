// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ArcPredixTypes.sol";

contract ArcPredixAgentRegistry is IArcPredixAgentRegistry {

    uint256 public constant MIN_STAKE            = 10e6;
    uint256 public constant MAX_REPUTATION       = 10_000;
    uint256 public constant STARTING_REPUTATION  = 5_000;
    uint256 public constant SLASH_AMOUNT_BPS     = 500;
    uint256 public constant REP_GAIN_PER_JOB     = 10;
    uint256 public constant REP_LOSS_PER_FAILURE = 50;

    IUSDC   public immutable usdc;
    address public           owner;

    uint256 public agentCount;

    mapping(address => AgentProfile) public profiles;
    mapping(address => bool)         public authorizedCallers;

    event AgentRegistered(address indexed agent, string name, uint256 stake, uint256 timestamp);
    event AgentDeactivated(address indexed agent);
    event AgentReactivated(address indexed agent);
    event StakeIncreased(address indexed agent, uint256 added, uint256 newTotal);
    event StakeWithdrawn(address indexed agent, uint256 amount);
    event AgentSlashed(address indexed agent, uint256 slashAmount, string reason);
    event ReputationUpdated(address indexed agent, uint256 oldScore, uint256 newScore, bool isPositive);
    event MetadataUpdated(address indexed agent, string newURI);
    event CallerAuthorized(address caller, bool authorized);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuthorized() {
        if (!authorizedCallers[msg.sender] && msg.sender != owner)
            revert Unauthorized();
        _;
    }

    modifier onlyActiveAgent() {
        if (!profiles[msg.sender].active) revert AgentNotActive();
        _;
    }

    constructor(address _usdc) {
        usdc  = IUSDC(_usdc);
        owner = msg.sender;
    }

    function register(
        string calldata name,
        string calldata metadataURI,
        uint256         stakeAmount
    ) external {
        if (profiles[msg.sender].owner != address(0)) revert AgentAlreadyRegistered();
        if (stakeAmount < MIN_STAKE)                  revert InsufficientStake();
        if (bytes(name).length == 0)                  revert ZeroAmount();

        if (!usdc.transferFrom(msg.sender, address(this), stakeAmount))
            revert TransferFailed();

        profiles[msg.sender] = AgentProfile({
            owner:               msg.sender,
            name:                name,
            metadataURI:         metadataURI,
            stake:               stakeAmount,
            reputationScore:     STARTING_REPUTATION,
            jobsCompleted:       0,
            jobsFailed:          0,
            totalVolumeProvided: 0,
            active:              true,
            registeredAt:        block.timestamp,
            lastActivityAt:      block.timestamp
        });

        agentCount++;

        emit AgentRegistered(msg.sender, name, stakeAmount, block.timestamp);
    }

    function increaseStake(uint256 amount) external onlyActiveAgent {
        if (amount == 0) revert ZeroAmount();

        if (!usdc.transferFrom(msg.sender, address(this), amount))
            revert TransferFailed();

        profiles[msg.sender].stake += amount;

        emit StakeIncreased(msg.sender, amount, profiles[msg.sender].stake);
    }

    function withdrawStake(uint256 amount) external {
        AgentProfile storage profile = profiles[msg.sender];
        if (profile.owner == address(0)) revert AgentNotActive();
        if (profile.stake < amount)      revert InsufficientStake();

        uint256 remaining = profile.stake - amount;
        if (profile.active && remaining < MIN_STAKE)
            revert InsufficientStake();

        profile.stake -= amount;

        if (!usdc.transfer(msg.sender, amount)) revert TransferFailed();

        emit StakeWithdrawn(msg.sender, amount);
    }

    function recordJobCompletion(
        address agent,
        uint256 volume
    ) external override onlyAuthorized {
        AgentProfile storage p = profiles[agent];
        if (p.owner == address(0)) revert AgentNotActive();

        p.jobsCompleted       += 1;
        p.totalVolumeProvided += volume;
        p.lastActivityAt       = block.timestamp;

        uint256 oldScore = p.reputationScore;
        uint256 gain     = REP_GAIN_PER_JOB;

        if (p.jobsCompleted % 10 == 0) gain = gain * 3;

        p.reputationScore = _clamp(oldScore + gain, 0, MAX_REPUTATION);

        emit ReputationUpdated(agent, oldScore, p.reputationScore, true);
    }

    function recordJobFailure(address agent) external override onlyAuthorized {
        AgentProfile storage p = profiles[agent];
        if (p.owner == address(0)) return;

        p.jobsFailed     += 1;
        p.lastActivityAt  = block.timestamp;

        uint256 slashAmount = (p.stake * SLASH_AMOUNT_BPS) / 10_000;
        if (slashAmount > 0 && p.stake >= slashAmount) {
            p.stake -= slashAmount;
            if (!usdc.transfer(owner, slashAmount)) revert TransferFailed();
            emit AgentSlashed(agent, slashAmount, "job_failure");
        }

        uint256 oldScore = p.reputationScore;
        p.reputationScore = p.reputationScore > REP_LOSS_PER_FAILURE
            ? p.reputationScore - REP_LOSS_PER_FAILURE
            : 0;

        if (p.reputationScore == 0) {
            p.active = false;
            emit AgentDeactivated(agent);
        }

        emit ReputationUpdated(agent, oldScore, p.reputationScore, false);
    }

    function updateMetadata(string calldata newURI) external onlyActiveAgent {
        profiles[msg.sender].metadataURI = newURI;
        emit MetadataUpdated(msg.sender, newURI);
    }

    function deactivate() external {
        if (profiles[msg.sender].owner == address(0)) revert AgentNotActive();
        profiles[msg.sender].active = false;
        emit AgentDeactivated(msg.sender);
    }

    function reactivate() external {
        AgentProfile storage p = profiles[msg.sender];
        if (p.owner == address(0)) revert AgentNotActive();
        if (p.stake < MIN_STAKE)   revert InsufficientStake();
        p.active = true;
        emit AgentReactivated(msg.sender);
    }

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorized(caller, authorized);
    }

    function isActive(address agent) external view override returns (bool) {
        return profiles[agent].active;
    }

    function getProfile(address agent)
        external view override returns (AgentProfile memory)
    {
        return profiles[agent];
    }

    function getReputationScore(address agent)
        external view override returns (uint256)
    {
        return profiles[agent].reputationScore;
    }

    function getAgentTier(address agent) external view returns (uint8) {
        uint256 score = profiles[agent].reputationScore;
        if (score == 0)    return 0;
        if (score < 2_500) return 1;
        if (score < 5_000) return 2;
        if (score < 7_500) return 3;
        return                    4;
    }

    function _clamp(uint256 val, uint256 min_, uint256 max_)
        internal pure returns (uint256)
    {
        if (val < min_) return min_;
        if (val > max_) return max_;
        return val;
    }
}

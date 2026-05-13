// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ArcPredixTypes.sol";

contract ArcPredixNanoStreamer {

    uint256 public constant STREAM_FEE_RATE_BPS = 10;
    uint256 public constant SECONDS_PER_DAY     = 86_400;
    uint256 public constant MIN_LP_TO_STREAM    = 1e6;

    IUSDC   public immutable usdc;
    address public           owner;

    mapping(bytes32 => StreamPosition) public streams;
    mapping(address => bytes32[])      public agentStreams;
    mapping(address => uint256)        public marketTotalStreamingLp;
    mapping(address => uint256)        public marketRewardPool;

    event StreamStarted(bytes32 indexed streamId, address indexed agent, address indexed market, uint256 liquidityProvided, uint256 ratePerSecond, uint256 startedAt);
    event StreamClaimed(bytes32 indexed streamId, address indexed agent, uint256 amount, uint256 claimedAt);
    event StreamStopped(bytes32 indexed streamId, address indexed agent, uint256 finalClaim);
    event RewardPoolFunded(address indexed market, uint256 amount);

    constructor(address _usdc) {
        usdc  = IUSDC(_usdc);
        owner = msg.sender;
    }

    function fundMarketPool(address market, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        if (!usdc.transferFrom(msg.sender, address(this), amount))
            revert TransferFailed();

        marketRewardPool[market] += amount;

        emit RewardPoolFunded(market, amount);
    }

    function startStream(
        address market,
        uint256 lpAmount
    ) external returns (bytes32 streamId) {
        if (lpAmount < MIN_LP_TO_STREAM) revert InsufficientLiquidity();
        if (market == address(0))        revert ZeroAmount();

        streamId = _streamKey(msg.sender, market);

        StreamPosition storage existing = streams[streamId];
        if (existing.active) revert AgentAlreadyRegistered();

        uint256 ratePerSecond = (lpAmount * STREAM_FEE_RATE_BPS)
            / (10_000 * SECONDS_PER_DAY);

        streams[streamId] = StreamPosition({
            agent:             msg.sender,
            market:            market,
            liquidityProvided: lpAmount,
            ratePerSecond:     ratePerSecond,
            startedAt:         block.timestamp,
            lastClaimedAt:     block.timestamp,
            totalClaimed:      0,
            active:            true
        });

        agentStreams[msg.sender].push(streamId);
        marketTotalStreamingLp[market] += lpAmount;

        emit StreamStarted(
            streamId,
            msg.sender,
            market,
            lpAmount,
            ratePerSecond,
            block.timestamp
        );
    }

    function claimStream(bytes32 streamId) external returns (uint256 claimable) {
        StreamPosition storage stream = streams[streamId];

        if (!stream.active)             revert AgentNotActive();
        if (stream.agent != msg.sender) revert Unauthorized();

        claimable = _pendingEarnings(stream);
        if (claimable == 0) return 0;

        uint256 poolBalance = marketRewardPool[stream.market];
        if (claimable > poolBalance) claimable = poolBalance;

        stream.lastClaimedAt           = block.timestamp;
        stream.totalClaimed           += claimable;
        marketRewardPool[stream.market] -= claimable;

        if (!usdc.transfer(msg.sender, claimable)) revert TransferFailed();

        emit StreamClaimed(streamId, msg.sender, claimable, block.timestamp);
    }

    function claimAllStreams() external returns (uint256 totalClaimed) {
        bytes32[] storage keys = agentStreams[msg.sender];
        uint256 len = keys.length;

        for (uint256 i = 0; i < len; i++) {
            StreamPosition storage stream = streams[keys[i]];
            if (!stream.active) continue;

            uint256 claimable   = _pendingEarnings(stream);
            if (claimable == 0) continue;

            uint256 poolBalance = marketRewardPool[stream.market];
            if (poolBalance == 0) continue;

            if (claimable > poolBalance) claimable = poolBalance;

            stream.lastClaimedAt             = block.timestamp;
            stream.totalClaimed             += claimable;
            marketRewardPool[stream.market] -= claimable;
            totalClaimed                    += claimable;
        }

        if (totalClaimed > 0) {
            if (!usdc.transfer(msg.sender, totalClaimed)) revert TransferFailed();
        }
    }

    function stopStream(bytes32 streamId) external returns (uint256 finalClaim) {
        StreamPosition storage stream = streams[streamId];

        if (!stream.active)             revert AgentNotActive();
        if (stream.agent != msg.sender) revert Unauthorized();

        finalClaim = _pendingEarnings(stream);
        uint256 poolBalance = marketRewardPool[stream.market];
        if (finalClaim > poolBalance) finalClaim = poolBalance;

        stream.active        = false;
        stream.lastClaimedAt = block.timestamp;
        stream.totalClaimed += finalClaim;

        marketTotalStreamingLp[stream.market] -= stream.liquidityProvided;

        if (finalClaim > 0) {
            marketRewardPool[stream.market] -= finalClaim;
            if (!usdc.transfer(msg.sender, finalClaim)) revert TransferFailed();
        }

        emit StreamStopped(streamId, msg.sender, finalClaim);
    }

    function pendingEarnings(bytes32 streamId)
        external view returns (uint256)
    {
        StreamPosition storage s = streams[streamId];
        if (!s.active) return 0;
        return _pendingEarnings(s);
    }

    function getAgentStreams(address agent)
        external view returns (bytes32[] memory)
    {
        return agentStreams[agent];
    }

    function getStream(bytes32 streamId)
        external view returns (StreamPosition memory)
    {
        return streams[streamId];
    }

    function getMarketPool(address market) external view returns (uint256) {
        return marketRewardPool[market];
    }

    function _pendingEarnings(StreamPosition storage s)
        internal view returns (uint256)
    {
        uint256 elapsed = block.timestamp - s.lastClaimedAt;
        return elapsed * s.ratePerSecond;
    }

    function _streamKey(address agent, address market)
        internal pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(agent, market));
    }
}

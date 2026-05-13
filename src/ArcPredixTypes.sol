// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// ─────────────────────────────────────────────
//  ARCPREDIX PROTOCOL — Shared Types & Interfaces
//  Built for Arc Testnet (Chain ID: 5042002)
//  USDC as native gas token
// ─────────────────────────────────────────────

// ── Enums ────────────────────────────────────

enum Outcome {
    UNRESOLVED,
    YES,
    NO,
    INVALID   // oracle dispute / cancelled
}

enum JobStatus {
    OPEN,
    ACCEPTED,
    COMPLETED,
    CANCELLED,
    DISPUTED
}

// ── Structs ───────────────────────────────────

struct MarketConfig {
    string  question;          // plaintext prediction question
    uint256 resolutionTime;    // unix timestamp: earliest resolution
    uint256 expiryTime;        // unix timestamp: market auto-invalidates if unresolved
    address oracle;            // address authorized to resolve this market
    uint256 initialLiquidity;  // USDC seed from creator (18 decimals)
    uint16  feeBps;            // protocol fee in basis points (e.g. 50 = 0.5%)
}

struct MarketState {
    uint256 yesPool;           // USDC in YES side (18 dec)
    uint256 noPool;            // USDC in NO side  (18 dec)
    uint256 yesShares;         // total YES shares outstanding (18 dec)
    uint256 noShares;          // total NO shares outstanding  (18 dec)
    uint256 totalVolume;       // cumulative USDC traded
    Outcome outcome;
    bool    resolved;
    uint256 resolvedAt;
}

struct Position {
    uint256 yesShares;
    uint256 noShares;
    uint256 totalDeposited;    // USDC deposited by this user
}

// ERC-8004 inspired — onchain agent identity
struct AgentProfile {
    address owner;
    string  name;
    string  metadataURI;       // ipfs/arweave pointer to agent description
    uint256 stake;             // USDC staked as skin-in-the-game (18 dec)
    uint256 reputationScore;   // 0–10000 (basis points of max)
    uint256 jobsCompleted;
    uint256 jobsFailed;
    uint256 totalVolumeProvided;
    bool    active;
    uint256 registeredAt;
    uint256 lastActivityAt;
}

// ERC-8183 inspired — on-chain liquidity job
struct LiquidityJob {
    uint256 id;
    address poster;
    address market;
    uint256 requiredLiquidity;  // USDC amount agent must provide
    uint256 durationSeconds;    // how long agent must hold the LP position
    uint256 payment;            // USDC reward for completing the job
    uint256 minReputation;      // minimum agent reputation score required
    address assignedAgent;
    JobStatus status;
    uint256 postedAt;
    uint256 acceptedAt;
    uint256 completedAt;
}

// Per-second streaming fee accumulator for market makers
struct StreamPosition {
    address agent;
    address market;
    uint256 liquidityProvided;  // USDC in LP
    uint256 ratePerSecond;      // USDC earned per second (18 dec)
    uint256 startedAt;
    uint256 lastClaimedAt;
    uint256 totalClaimed;
    bool    active;
}

// ── Interfaces ────────────────────────────────

interface IUSDC {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IArcPredixMarket {
    function buyYes(uint256 usdcAmount) external returns (uint256 sharesOut);
    function buyNo(uint256 usdcAmount) external returns (uint256 sharesOut);
    function sellYes(uint256 shares) external returns (uint256 usdcOut);
    function sellNo(uint256 shares) external returns (uint256 usdcOut);
    function claimPayout() external returns (uint256 payout);
    function resolve(Outcome outcome) external;
    function addLiquidity(uint256 usdcAmount) external returns (uint256 lpShares);
    function removeLiquidity(uint256 lpShares) external returns (uint256 usdcOut);
    function getState() external view returns (MarketState memory);
    function getPriceYes() external view returns (uint256); // 1e18 = 100%
    function getPriceNo() external view returns (uint256);
}

interface IArcPredixAgentRegistry {
    function isActive(address agent) external view returns (bool);
    function getProfile(address agent) external view returns (AgentProfile memory);
    function getReputationScore(address agent) external view returns (uint256);
    function recordJobCompletion(address agent, uint256 volume) external;
    function recordJobFailure(address agent) external;
}

// ── Custom Errors ─────────────────────────────

error NotOracle();
error AlreadyResolved();
error MarketNotResolved();
error MarketExpired();
error MarketNotExpired();
error InsufficientLiquidity();
error InsufficientShares();
error InsufficientReputation();
error ZeroAmount();
error InvalidOutcome();
error JobNotOpen();
error JobNotAccepted();
error AgentNotActive();
error AgentAlreadyRegistered();
error InsufficientStake();
error TransferFailed();
error Unauthorized();
error DeadlineNotReached();
error SlippageExceeded();

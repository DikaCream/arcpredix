// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ArcPredixTypes.sol";

contract ArcPredixMarket {

    uint256 public constant PRECISION     = 1e18;
    uint256 public constant MAX_FEE_BPS   = 500;
    uint256 public constant MIN_LIQUIDITY = 10e6;

    IUSDC   public immutable usdc;
    address public immutable factory;

    string  public question;
    uint256 public immutable resolutionTime;
    uint256 public immutable expiryTime;
    address public immutable oracle;
    uint16  public immutable feeBps;

    uint256 public yesPool;
    uint256 public noPool;
    uint256 public totalYesShares;
    uint256 public totalNoShares;
    uint256 public totalLpShares;

    Outcome public outcome;
    bool    public resolved;
    uint256 public resolvedAt;
    uint256 public totalVolume;
    uint256 public accruedFees;

    mapping(address => Position) public positions;
    mapping(address => uint256)  public lpShares;

    event Bought(address indexed trader, bool indexed isYes, uint256 usdcIn, uint256 sharesOut, uint256 newPriceYes);
    event Sold(address indexed trader, bool indexed isYes, uint256 sharesIn, uint256 usdcOut, uint256 newPriceYes);
    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 lpShares);
    event LiquidityRemoved(address indexed provider, uint256 lpSharesBurned, uint256 usdcOut);
    event MarketResolved(address indexed oracle, Outcome outcome, uint256 timestamp);
    event PayoutClaimed(address indexed winner, uint256 shares, uint256 payout);

    constructor(address _usdc, address _factory, MarketConfig memory cfg) {
        usdc           = IUSDC(_usdc);
        factory        = _factory;
        question       = cfg.question;
        resolutionTime = cfg.resolutionTime;
        expiryTime     = cfg.expiryTime;
        oracle         = cfg.oracle;
        feeBps         = cfg.feeBps;
    }

    function seed(address creator, uint256 usdcAmount) external {
        if (msg.sender != factory)      revert Unauthorized();
        if (usdcAmount < MIN_LIQUIDITY) revert InsufficientLiquidity();

        if (!usdc.transferFrom(creator, address(this), usdcAmount))
            revert TransferFailed();

        uint256 half = usdcAmount / 2;
        yesPool = half;
        noPool  = usdcAmount - half;

        lpShares[creator] = usdcAmount;
        totalLpShares     = usdcAmount;

        emit LiquidityAdded(creator, usdcAmount, usdcAmount);
    }

    function buyYes(uint256 usdcAmount, uint256 minSharesOut) external returns (uint256 sharesOut) {
        _assertActive();
        if (usdcAmount == 0) revert ZeroAmount();

        uint256 fee       = (usdcAmount * feeBps) / 10_000;
        uint256 netAmount = usdcAmount - fee;
        accruedFees      += fee;

        uint256 k         = yesPool * noPool;
        uint256 newNoPool = noPool + netAmount;
        uint256 newYesPool = k / newNoPool;
        sharesOut          = yesPool - newYesPool;

        if (sharesOut < minSharesOut) revert SlippageExceeded();
        if (sharesOut == 0)           revert InsufficientLiquidity();

        yesPool = newYesPool;
        noPool  = newNoPool;
        totalYesShares += sharesOut;
        totalVolume    += usdcAmount;

        positions[msg.sender].yesShares      += sharesOut;
        positions[msg.sender].totalDeposited += usdcAmount;

        if (!usdc.transferFrom(msg.sender, address(this), usdcAmount))
            revert TransferFailed();

        emit Bought(msg.sender, true, usdcAmount, sharesOut, getPriceYes());
    }

    function buyNo(uint256 usdcAmount, uint256 minSharesOut) external returns (uint256 sharesOut) {
        _assertActive();
        if (usdcAmount == 0) revert ZeroAmount();

        uint256 fee       = (usdcAmount * feeBps) / 10_000;
        uint256 netAmount = usdcAmount - fee;
        accruedFees      += fee;

        uint256 k          = yesPool * noPool;
        uint256 newYesPool = yesPool + netAmount;
        uint256 newNoPool  = k / newYesPool;
        sharesOut           = noPool - newNoPool;

        if (sharesOut < minSharesOut) revert SlippageExceeded();
        if (sharesOut == 0)           revert InsufficientLiquidity();

        yesPool = newYesPool;
        noPool  = newNoPool;
        totalNoShares += sharesOut;
        totalVolume   += usdcAmount;

        positions[msg.sender].noShares       += sharesOut;
        positions[msg.sender].totalDeposited += usdcAmount;

        if (!usdc.transferFrom(msg.sender, address(this), usdcAmount))
            revert TransferFailed();

        emit Bought(msg.sender, false, usdcAmount, sharesOut, getPriceYes());
    }

    function sellYes(uint256 shares, uint256 minUsdcOut) external returns (uint256 usdcOut) {
        _assertActive();
        if (shares == 0) revert ZeroAmount();
        if (positions[msg.sender].yesShares < shares) revert InsufficientShares();

        uint256 k          = yesPool * noPool;
        uint256 newYesPool = yesPool + shares;
        uint256 newNoPool  = k / newYesPool;
        usdcOut             = noPool - newNoPool;

        uint256 fee = (usdcOut * feeBps) / 10_000;
        usdcOut    -= fee;
        accruedFees += fee;

        if (usdcOut < minUsdcOut) revert SlippageExceeded();

        yesPool = newYesPool;
        noPool  = newNoPool;
        totalYesShares -= shares;
        positions[msg.sender].yesShares -= shares;

        if (!usdc.transfer(msg.sender, usdcOut)) revert TransferFailed();

        emit Sold(msg.sender, true, shares, usdcOut, getPriceYes());
    }

    function sellNo(uint256 shares, uint256 minUsdcOut) external returns (uint256 usdcOut) {
        _assertActive();
        if (shares == 0) revert ZeroAmount();
        if (positions[msg.sender].noShares < shares) revert InsufficientShares();

        uint256 k          = yesPool * noPool;
        uint256 newNoPool  = noPool + shares;
        uint256 newYesPool = k / newNoPool;
        usdcOut             = yesPool - newYesPool;

        uint256 fee = (usdcOut * feeBps) / 10_000;
        usdcOut    -= fee;
        accruedFees += fee;

        if (usdcOut < minUsdcOut) revert SlippageExceeded();

        yesPool = newYesPool;
        noPool  = newNoPool;
        totalNoShares -= shares;
        positions[msg.sender].noShares -= shares;

        if (!usdc.transfer(msg.sender, usdcOut)) revert TransferFailed();

        emit Sold(msg.sender, false, shares, usdcOut, getPriceYes());
    }

    function addLiquidity(uint256 usdcAmount) external returns (uint256 shares) {
        _assertActive();
        if (usdcAmount < MIN_LIQUIDITY) revert InsufficientLiquidity();

        uint256 totalUsdc = yesPool + noPool;
        shares = totalLpShares == 0
            ? usdcAmount
            : (usdcAmount * totalLpShares) / totalUsdc;

        uint256 yesAdd = (usdcAmount * yesPool) / totalUsdc;
        uint256 noAdd  = usdcAmount - yesAdd;

        yesPool += yesAdd;
        noPool  += noAdd;
        lpShares[msg.sender] += shares;
        totalLpShares        += shares;

        if (!usdc.transferFrom(msg.sender, address(this), usdcAmount))
            revert TransferFailed();

        emit LiquidityAdded(msg.sender, usdcAmount, shares);
    }

    function removeLiquidity(uint256 shares) external returns (uint256 usdcOut) {
        if (lpShares[msg.sender] < shares) revert InsufficientShares();

        uint256 totalUsdc = yesPool + noPool;
        usdcOut = (shares * totalUsdc) / totalLpShares;

        uint256 yesRemove = (shares * yesPool) / totalLpShares;
        uint256 noRemove  = usdcOut - yesRemove;

        yesPool -= yesRemove;
        noPool  -= noRemove;
        lpShares[msg.sender] -= shares;
        totalLpShares        -= shares;

        if (!usdc.transfer(msg.sender, usdcOut)) revert TransferFailed();

        emit LiquidityRemoved(msg.sender, shares, usdcOut);
    }

    function resolve(Outcome _outcome) external {
        if (msg.sender != oracle)             revert NotOracle();
        if (resolved)                         revert AlreadyResolved();
        if (block.timestamp < resolutionTime) revert DeadlineNotReached();
        if (_outcome == Outcome.UNRESOLVED)   revert InvalidOutcome();

        outcome    = _outcome;
        resolved   = true;
        resolvedAt = block.timestamp;

        emit MarketResolved(msg.sender, _outcome, block.timestamp);
    }

    function claimPayout() external returns (uint256 payout) {
        if (!resolved) revert MarketNotResolved();

        Position storage pos = positions[msg.sender];

        if (outcome == Outcome.YES) {
            uint256 shares = pos.yesShares;
            if (shares == 0) revert InsufficientShares();
            payout = (shares * (yesPool + noPool)) / totalYesShares;
            pos.yesShares = 0;
        } else if (outcome == Outcome.NO) {
            uint256 shares = pos.noShares;
            if (shares == 0) revert InsufficientShares();
            payout = (shares * (yesPool + noPool)) / totalNoShares;
            pos.noShares = 0;
        } else {
            uint256 total = pos.totalDeposited;
            if (total == 0) revert ZeroAmount();
            payout = total;
            pos.totalDeposited = 0;
            pos.yesShares      = 0;
            pos.noShares       = 0;
        }

        if (!usdc.transfer(msg.sender, payout)) revert TransferFailed();

        emit PayoutClaimed(msg.sender, 0, payout);
    }

    function getPriceYes() public view returns (uint256) {
        if (yesPool + noPool == 0) return 5e17;
        return (noPool * PRECISION) / (yesPool + noPool);
    }

    function getPriceNo() public view returns (uint256) {
        return PRECISION - getPriceYes();
    }

    function getState() external view returns (MarketState memory) {
        return MarketState({
            yesPool:     yesPool,
            noPool:      noPool,
            yesShares:   totalYesShares,
            noShares:    totalNoShares,
            totalVolume: totalVolume,
            outcome:     outcome,
            resolved:    resolved,
            resolvedAt:  resolvedAt
        });
    }

    function previewBuyYes(uint256 usdcAmount) external view returns (uint256 sharesOut) {
        uint256 netAmount  = usdcAmount - (usdcAmount * feeBps) / 10_000;
        uint256 k          = yesPool * noPool;
        uint256 newNoPool  = noPool + netAmount;
        sharesOut           = yesPool - (k / newNoPool);
    }

    function previewBuyNo(uint256 usdcAmount) external view returns (uint256 sharesOut) {
        uint256 netAmount  = usdcAmount - (usdcAmount * feeBps) / 10_000;
        uint256 k          = yesPool * noPool;
        uint256 newYesPool = yesPool + netAmount;
        sharesOut           = noPool - (k / newYesPool);
    }

    function _assertActive() internal view {
        if (resolved)                     revert AlreadyResolved();
        if (block.timestamp > expiryTime) revert MarketExpired();
    }
}

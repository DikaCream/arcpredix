// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ArcPredixTypes.sol";
import "./ArcPredixMarket.sol";

contract ArcPredixMarketFactory {

    uint256 public constant MIN_RESOLUTION_DELAY = 1 hours;
    uint256 public constant MAX_EXPIRY_WINDOW     = 365 days;
    uint16  public constant DEFAULT_FEE_BPS       = 50;
    uint256 public constant MAX_FEE_BPS           = 500;

    IUSDC   public immutable usdc;
    address public           owner;
    address public           feeRecipient;

    uint256 public marketCount;

    mapping(uint256 => address)   public markets;
    mapping(address => uint256)   public marketIds;
    mapping(address => uint256[]) public creatorMarkets;
    mapping(address => uint256[]) public oracleMarkets;

    bool    public oracleWhitelistEnabled;
    mapping(address => bool) public approvedOracles;

    event MarketCreated(
        uint256 indexed marketId,
        address indexed market,
        address indexed creator,
        address         oracle,
        string          question,
        uint256         resolutionTime
    );
    event OracleApproved(address indexed oracle, bool approved);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _usdc, address _feeRecipient) {
        usdc                   = IUSDC(_usdc);
        owner                  = msg.sender;
        feeRecipient           = _feeRecipient;
        oracleWhitelistEnabled = false;
    }

    function createMarket(
        MarketConfig calldata cfg,
        uint256 seedLiquidity
    ) external returns (uint256 marketId, address market) {

        if (bytes(cfg.question).length == 0)                          revert ZeroAmount();
        if (cfg.resolutionTime < block.timestamp + MIN_RESOLUTION_DELAY) revert DeadlineNotReached();
        if (cfg.expiryTime <= cfg.resolutionTime)                     revert InvalidOutcome();
        if (cfg.expiryTime > block.timestamp + MAX_EXPIRY_WINDOW)     revert MarketExpired();
        if (cfg.feeBps > MAX_FEE_BPS)                                 revert InvalidOutcome();
        if (oracleWhitelistEnabled && !approvedOracles[cfg.oracle])   revert Unauthorized();

        ArcPredixMarket newMarket = new ArcPredixMarket(
            address(usdc),
            address(this),
            cfg
        );

        market   = address(newMarket);
        marketId = ++marketCount;

        markets[marketId]    = market;
        marketIds[market]    = marketId;
        creatorMarkets[msg.sender].push(marketId);
        oracleMarkets[cfg.oracle].push(marketId);

        if (!usdc.transferFrom(msg.sender, address(this), seedLiquidity))
            revert TransferFailed();

        if (!usdc.approve(market, seedLiquidity))
            revert TransferFailed();

        newMarket.seed(address(this), seedLiquidity);

        emit MarketCreated(
            marketId,
            market,
            msg.sender,
            cfg.oracle,
            cfg.question,
            cfg.resolutionTime
        );
    }

    function setOracleApproval(address oracle, bool approved) external {
        if (msg.sender != owner) revert Unauthorized();
        approvedOracles[oracle] = approved;
        emit OracleApproved(oracle, approved);
    }

    function setOracleWhitelist(bool enabled) external {
        if (msg.sender != owner) revert Unauthorized();
        oracleWhitelistEnabled = enabled;
    }

    function setFeeRecipient(address newRecipient) external {
        if (msg.sender != owner) revert Unauthorized();
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function getMarkets(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory result) {
        uint256 count = marketCount;
        if (offset >= count) return new address[](0);

        uint256 end = offset + limit > count ? count : offset + limit;
        result = new address[](end - offset);

        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = markets[i + 1];
        }
    }

    function getCreatorMarkets(address creator)
        external view returns (uint256[] memory)
    {
        return creatorMarkets[creator];
    }

    function getOracleMarkets(address oracle)
        external view returns (uint256[] memory)
    {
        return oracleMarkets[oracle];
    }
}

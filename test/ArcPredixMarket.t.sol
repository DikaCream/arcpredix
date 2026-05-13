// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/ArcPredixTypes.sol";
import "../src/ArcPredixMarket.sol";
import "../src/ArcPredixMarketFactory.sol";

contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
}

contract ArcPredixMarketTest is Test {

    MockUSDC usdc;
    ArcPredixMarket market;

    address factory  = address(this);
    address oracle   = address(0xABC);
    address trader1  = address(0x1);
    address trader2  = address(0x2);

    uint256 constant SEED = 1000e6; // 1000 USDC

    function setUp() public {
        usdc = new MockUSDC();

        MarketConfig memory cfg = MarketConfig({
            question:         "Will BTC exceed $100k?",
            resolutionTime:   block.timestamp + 1 days,
            expiryTime:       block.timestamp + 2 days,
            oracle:           oracle,
            initialLiquidity: SEED,
            feeBps:           50
        });

        market = new ArcPredixMarket(address(usdc), factory, cfg);

        // Seed liquidity
        usdc.mint(address(this), SEED);
        usdc.approve(address(market), SEED);
        market.seed(address(this), SEED);

        // Fund traders
        usdc.mint(trader1, 500e6);
        usdc.mint(trader2, 500e6);
    }

    function testInitialPrice() public view {
        uint256 priceYes = market.getPriceYes();
        uint256 priceNo  = market.getPriceNo();
        assertEq(priceYes + priceNo, 1e18);
        assertEq(priceYes, 5e17); // 50%
    }

    function testBuyYes() public {
        vm.startPrank(trader1);
        usdc.approve(address(market), 100e6);
        uint256 shares = market.buyYes(100e6, 0);
        vm.stopPrank();

        assertGt(shares, 0);
        assertGt(market.getPriceYes(), 5e17); // price increases
    }

    function testBuyNo() public {
        vm.startPrank(trader1);
        usdc.approve(address(market), 100e6);
        uint256 shares = market.buyNo(100e6, 0);
        vm.stopPrank();

        assertGt(shares, 0);
        assertLt(market.getPriceYes(), 5e17); // yes price decreases
    }

    function testSellYes() public {
        vm.startPrank(trader1);
        usdc.approve(address(market), 100e6);
        uint256 shares = market.buyYes(100e6, 0);
        uint256 usdcOut = market.sellYes(shares / 2, 0);
        vm.stopPrank();

        assertGt(usdcOut, 0);
    }

    function testResolveAndClaim() public {
        // trader1 buys YES
        vm.startPrank(trader1);
        usdc.approve(address(market), 100e6);
        market.buyYes(100e6, 0);
        vm.stopPrank();

        // resolve YES
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(oracle);
        market.resolve(Outcome.YES);

        // trader1 claims payout
        uint256 balanceBefore = usdc.balanceOf(trader1);
        vm.prank(trader1);
        uint256 payout = market.claimPayout();

        assertGt(payout, 0);
        assertGt(usdc.balanceOf(trader1), balanceBefore);
    }

    function testOnlyOracleCanResolve() public {
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(trader1);
        vm.expectRevert(NotOracle.selector);
        market.resolve(Outcome.YES);
    }

    function testCannotBuyAfterExpiry() public {
        vm.warp(block.timestamp + 3 days);
        vm.startPrank(trader1);
        usdc.approve(address(market), 100e6);
        vm.expectRevert(MarketExpired.selector);
        market.buyYes(100e6, 0);
        vm.stopPrank();
    }

    function testAddLiquidity() public {
        vm.startPrank(trader1);
        usdc.approve(address(market), 200e6);
        uint256 lpShares = market.addLiquidity(200e6);
        vm.stopPrank();

        assertGt(lpShares, 0);
        assertGt(market.totalLpShares(), SEED);
    }
}

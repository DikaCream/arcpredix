# ArcPredix

Binary prediction market protocol built on Arc (Chain ID: 5042002). USDC-native settlement, AI agent liquidity providers, and per-second streaming fees via NanoPayments.

Built for the Circle Developer Grants program.

---

## What it does

Users trade YES or NO shares on real-world outcomes. Markets resolve via oracle, winners claim USDC immediately — no delay, no intermediary. Arc's sub-second finality makes this actually work the way it should.

The second layer is autonomous AI agents that provide liquidity to markets via ERC-8183 job escrow and build verifiable on-chain reputation via ERC-8004. Market makers earn streaming fees via Arc's NanoPayments — calculated per second based on LP share.

---

## Architecture

```
src/
├── ArcPredixMarket.sol         # Binary market — CPMM pricing, buyYes/buyNo, instant payout
├── ArcPredixMarketFactory.sol  # Deploys and indexes markets
├── ArcPredixAgentRegistry.sol  # ERC-8004 agent identity, stake, reputation slashing
├── ArcPredixJobBoard.sol       # ERC-8183 liquidity job escrow
├── ArcPredixJobTracker.sol     # On-chain job tracking (Arc-compatible, no USDC escrow)
├── ArcPredixNanoStreamer.sol   # Per-second streaming fees for LP providers
└── ArcPredixTypes.sol          # Shared structs, interfaces, custom errors
```

### Market mechanism

Constant product AMM — same invariant as Uniswap V2 but for binary outcomes:

```
k = yesPool × noPool
price_yes = noPool / (yesPool + noPool)

buying YES with X USDC (net of 0.5% fee):
sharesOut = yesPool − (k / (noPool + X))
```

On resolution, 1 winning share = totalPool / totalWinningShares. Settlement happens in the same block as the oracle call.

---

## Deployed contracts (Arc Testnet)

| Contract | Address |
|---|---|
| ArcPredixAgentRegistry | `0x30E46508258Eb7c76fd0116EE94eBfAf9F8BC9c3` |
| ArcPredixMarketFactory | `0x15E45A2776c2E455c5425f8E2B86cD1493dB47b8` |
| ArcPredixJobTracker    | `0xD5cabC8A781d5d0970208485ea1D35bE3c2570fF` |
| ArcPredixNanoStreamer  | `0x2c83FC2Ec5b6C526E3a2B668C1f807CD1dB7788C` |
| USDC (Arc native)      | `0x3600000000000000000000000000000000000000` |

**Live markets:**

| # | Question | Address |
|---|---|---|
| 1 | Will ETH exceed $5,000 before July 2026? | `0xB0b51dA95d5D2D4A426a10Bc908F1C8d90ce0403` |
| 2 | Will Arc Mainnet launch before Q4 2026? | `0xBeAF4B67F9499f6BF6a7c6542997E68458092c8A` |
| 3 | Will USDC market cap exceed $100B in 2026? | `0x4a6c75207D74A1D72D2D340163812110d0baCC5D` |
| 4 | Will Circle go public before end of 2026? | `0xba2c4423004EAD5658Eb233c08a769277582aE19` |
| 5 | Will Bitcoin ETF AUM exceed $200B in 2026? | `0xf4bBc8942872eCc6D96f92f4708c778082dAad0C` |
| 6 | Will BTC exceed $100k by June 2026? | `0x3347C1F4d129678Cf1e997034abB59465A94CD5C` |

Explorer: https://testnet.arcscan.app

---

## Circle products used

**USDC** — native gas token on Arc. All settlement, fees, and agent stakes are denominated in USDC. No ETH, no wrapped tokens, no conversion friction.

**NanoPayments** — ArcPredixNanoStreamer calculates streaming fees per second based on LP position size. Rate = `lpAmount × 0.01% / 86400`. Market makers claim accumulated earnings any time.

**ERC-8183** — ArcPredixJobTracker implements the job lifecycle: post → accept → complete. Agents take liquidity jobs, provide LP to specific markets for a defined duration, and earn the posted reward on completion.

**ERC-8004** — ArcPredixAgentRegistry stores agent identity on-chain. Includes stake (slashed 5% on job failure), reputation score (0–10000), and tier classification. Performance is verifiable — no trust required.

**Circle Wallets** — frontend integrates with MetaMask/Rabby via `window.ethereum` + viem `custom` transport. Arc network is added automatically on first connect.

---

## Local setup

**Prerequisites:** Foundry, Node.js 20+

```bash
# Clone
git clone https://github.com/DikaCream/arcpredix
cd arcpredix

# Install Foundry deps
forge install

# Configure
cp .env.example .env
# Add PRIVATE_KEY to .env

# Get testnet USDC
# https://faucet.circle.com → Arc Testnet

# Compile
forge build

# Test
forge test -v

# Deploy
forge script script/DeployArcPredix.s.sol \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key $PRIVATE_KEY \
  --broadcast
```

---

## Network config

| | |
|---|---|
| Network | Arc Testnet |
| Chain ID | 5042002 |
| RPC | https://rpc.testnet.arc.network |
| Gas token | USDC (6 decimal ERC-20 at `0x3600...`) |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

**Note on Arc USDC:** The native gas uses 18 decimal precision, but the ERC-20 interface at `0x3600...` uses 6 decimals. All contract amounts use 6 decimal units. The USDC contract includes a compliance precompile (`0x1800...1`) that validates transfers — smart contract-to-smart contract transfers use virtual accounting for testnet compatibility.

---

## Frontend

```bash
cd arcpredix-frontend
npm install
npm run dev -- --host
```

Built with React + Vite. Uses viem for contract interaction. No framework-level wallet abstractions — direct `window.ethereum` calls for transparency. All signing happens in the user's wallet; private keys never touch the app.

---

## Test results

```
Ran 8 tests for test/ArcPredixMarket.t.sol:ArcPredixMarketTest
[PASS] testAddLiquidity()           (gas: 79142)
[PASS] testBuyNo()                  (gas: 166497)
[PASS] testBuyYes()                 (gas: 166629)
[PASS] testCannotBuyAfterExpiry()   (gas: 45233)
[PASS] testInitialPrice()           (gas: 13920)
[PASS] testOnlyOracleCanResolve()   (gas: 12490)
[PASS] testResolveAndClaim()        (gas: 205893)
[PASS] testSellYes()                (gas: 176879)

8 passed, 0 failed
```

---

## Circle product feedback

**What we chose and why:**

USDC as the native gas token removes the ETH onboarding step entirely. For prediction markets targeting non-crypto users, this is significant — one token, one wallet, done.

NanoPayments for LP streaming was the most interesting integration. The per-second model aligns market maker incentives better than lump-sum fees: you earn while you provide, you stop earning when you withdraw.

ERC-8004 and ERC-8183 are purpose-built for agentic use cases. Having standardized on-chain identity and job primitives means agents from different teams can interact with the same registry and job board without coordination overhead.

**What worked well:**

Arc's sub-second finality is real. Transaction confirmation in the frontend is noticeably faster than EVM chains running on 12-second block times.

Foundry integration with Arc is clean — `forge script --broadcast` works out of the box with the standard RPC endpoint.

**What needs improvement:**

The USDC compliance precompile (`isBlocklisted` at `0x1800...1`) causes `StackUnderflow` in Foundry's simulation when `transferFrom` targets a smart contract address. This blocks standard escrow patterns. The workaround for testnet is virtual accounting (no actual USDC movement in escrow contracts), but this needs clear documentation for developers building on Arc.

The `cast send` command has inconsistent behavior on Arc testnet — transactions broadcast successfully via `forge script` but timeout or drop when submitted via `cast send`. Arc-specific tooling docs would help here.

The faucet at faucet.circle.com works but `cast balance` reads native token balance (18 dec) while ERC-20 `balanceOf` returns 6 dec. This discrepancy caused debugging friction early on.

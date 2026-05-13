import os

files = {}

files['tailwind.config.js'] = '''/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { mono: ['"JetBrains Mono"', 'monospace'] },
      colors: {
        terminal: {
          bg: '#0a0a0a', card: '#111111', border: '#1f1f1f',
          green: '#00ff41', cyan: '#00d4ff', amber: '#ffb300',
          red: '#ff4444', purple: '#bf5fff', dim: '#444444', text: '#bbbbbb',
        }
      },
    },
  },
  plugins: [],
}
'''

files['vite.config.js'] = '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
'''

files['index.html'] = '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ArcPredix | Prediction Markets on Arc</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #0a0a0a; color: #bbbbbb; font-family: "JetBrains Mono", monospace; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: #00ff41; }
      ::selection { background: #00ff41; color: #0a0a0a; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'''

files['src/main.jsx'] = '''import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
'''

files['src/index.css'] = '''@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .term-box { @apply border border-terminal-border bg-terminal-card; }
  .term-box-green { @apply border border-terminal-green bg-terminal-card; box-shadow: 0 0 8px rgba(0,255,65,0.15); }
  .term-box-cyan  { @apply border border-terminal-cyan  bg-terminal-card; box-shadow: 0 0 8px rgba(0,212,255,0.15); }
  .btn-green { @apply border border-terminal-green text-terminal-green px-4 py-1.5 text-sm hover:bg-terminal-green hover:text-terminal-bg transition-all cursor-pointer font-mono font-semibold uppercase tracking-widest; }
  .btn-red   { @apply border border-terminal-red   text-terminal-red   px-4 py-1.5 text-sm hover:bg-terminal-red   hover:text-terminal-bg transition-all cursor-pointer font-mono font-semibold uppercase tracking-widest; }
  .btn-cyan  { @apply border border-terminal-cyan  text-terminal-cyan  px-4 py-1.5 text-sm hover:bg-terminal-cyan  hover:text-terminal-bg transition-all cursor-pointer font-mono font-semibold uppercase tracking-widest; }
  .btn-amber { @apply border border-terminal-amber text-terminal-amber px-4 py-1.5 text-sm hover:bg-terminal-amber hover:text-terminal-bg transition-all cursor-pointer font-mono font-semibold uppercase tracking-widest; }
  .label-green  { @apply text-terminal-green  text-xs font-semibold; }
  .label-cyan   { @apply text-terminal-cyan   text-xs font-semibold; }
  .label-amber  { @apply text-terminal-amber  text-xs font-semibold; }
  .label-red    { @apply text-terminal-red    text-xs font-semibold; }
  .label-dim    { @apply text-terminal-dim    text-xs; }
}

.scanline {
  position: fixed; top: 0; left: 0; right: 0; height: 2px; pointer-events: none; z-index: 9999;
  background: linear-gradient(transparent, rgba(0,255,65,0.08), transparent);
  animation: scan 10s linear infinite;
}
@keyframes scan { 0% { top: -2px; } 100% { top: 100vh; } }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
.glow-green { text-shadow: 0 0 8px rgba(0,255,65,0.7); }
.glow-cyan  { text-shadow: 0 0 8px rgba(0,212,255,0.7); }
.glow-amber { text-shadow: 0 0 8px rgba(255,179,0,0.7); }
.cursor-blink::after { content: "_"; animation: blink 1s step-end infinite; color: #00ff41; }
input[type="number"] { -moz-appearance: textfield; }
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
'''

files['src/config/contracts.js'] = '''export const ARC_TESTNET = {
  id: 5042002, name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
}
export const CONTRACTS = {
  USDC:     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  REGISTRY: "0xe135Cc4b11230f1665C997e823876ffC3533B062",
  FACTORY:  "0xdBEBA0dD610AC969161C3144974690E8fC29812F",
  JOBBOARD: "0x0b83dE45d737CD52a2237E53a169C3f4fB7ACF91",
  STREAMER: "0x6928D66A1CCE8a4cC934Ac2E4037612D1b260DE4",
}
'''

files['src/components/BootSequence.jsx'] = '''import { useState, useEffect } from "react"

const LINES = [
  { text: "ARCPREDIX PROTOCOL v1.0.0", color: "text-terminal-green", delay: 0 },
  { text: "Initializing Arc Testnet connection...", color: "text-terminal-dim", delay: 300 },
  { text: "> RPC: https://rpc.testnet.arc.network", color: "text-terminal-cyan", delay: 600 },
  { text: "> Chain ID: 5042002", color: "text-terminal-cyan", delay: 900 },
  { text: "> USDC native gas token detected", color: "text-terminal-amber", delay: 1200 },
  { text: "Loading smart contracts...", color: "text-terminal-dim", delay: 1500 },
  { text: "> ArcPredixMarketFactory   [OK]", color: "text-terminal-green", delay: 1800 },
  { text: "> ArcPredixAgentRegistry  [OK]", color: "text-terminal-green", delay: 2000 },
  { text: "> ArcPredixJobBoard       [OK]", color: "text-terminal-green", delay: 2200 },
  { text: "> ArcPredixNanoStreamer   [OK]", color: "text-terminal-green", delay: 2400 },
  { text: "System ready. Welcome to ArcPredix.", color: "text-terminal-green", delay: 2800 },
]

export default function BootSequence({ onDone }) {
  const [visible, setVisible] = useState([])
  useEffect(() => {
    LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisible(v => [...v, i])
        if (i === LINES.length - 1) setTimeout(onDone, 600)
      }, line.delay)
    })
  }, [])

  return (
    <div className="fixed inset-0 bg-terminal-bg flex items-center justify-center z-50">
      <div className="w-full max-w-2xl px-8">
        <div className="text-terminal-green text-2xl font-bold mb-2 glow-green tracking-widest">
          ██ ARCPREDIX ██
        </div>
        <div className="text-terminal-dim text-xs mb-8">
          Prediction Markets on Arc — Powered by Circle
        </div>
        <div className="space-y-1">
          {LINES.map((line, i) => (
            <div key={i} className={"text-sm font-mono transition-opacity duration-200 " + line.color + (visible.includes(i) ? " opacity-100" : " opacity-0")}>
              {line.text}
              {i === visible[visible.length - 1] && i < LINES.length - 1 && (
                <span style={{animation:"blink 1s step-end infinite"}}>_</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
'''

files['src/components/Header.jsx'] = '''export default function Header({ wallet, onConnect, activeTab, setActiveTab }) {
  const tabs = ["MARKETS", "AGENTS", "PORTFOLIO"]
  const short = wallet ? wallet.slice(0,6) + "..." + wallet.slice(-4) : null
  return (
    <header className="border-b border-terminal-border bg-terminal-card sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-terminal-green font-bold text-sm glow-green tracking-widest">ARCPREDIX</span>
          <span className="text-terminal-dim text-xs">v1.0.0</span>
          <span className="border border-terminal-amber text-terminal-amber text-xs px-2 py-0.5">TESTNET</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-terminal-dim">
          <span>CHAIN: <span className="text-terminal-cyan">5042002</span></span>
          <span>GAS: <span className="text-terminal-green">USDC</span></span>
          {wallet ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terminal-green" style={{animation:"blink 1s step-end infinite"}} />
              <span className="text-terminal-green">{short}</span>
            </div>
          ) : (
            <button onClick={onConnect} className="btn-green text-xs">CONNECT_WALLET</button>
          )}
        </div>
      </div>
      <div className="flex px-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={"px-5 py-2 text-xs font-semibold tracking-widest border-b-2 transition-all " + (
              activeTab === tab
                ? "border-terminal-green text-terminal-green"
                : "border-transparent text-terminal-dim hover:text-terminal-text"
            )}>
            {tab}
          </button>
        ))}
      </div>
    </header>
  )
}
'''

files['src/components/MarketCard.jsx'] = '''import { useState } from "react"
export default function MarketCard({ market, index, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const pctYes = Math.round((market.priceYes ?? 0.5) * 100)
  const pctNo  = 100 - pctYes
  const volume = market.totalVolume ? (Number(market.totalVolume) / 1e18).toFixed(0) : "0"
  return (
    <div
      className={"term-box p-4 cursor-pointer transition-all duration-150 " + (hovered ? "border-terminal-green" : "border-terminal-border")}
      style={{ boxShadow: hovered ? "0 0 16px rgba(0,255,65,0.12)" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(market)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-terminal-dim text-xs">MKT-{String(index).padStart(3,"0")}</span>
        <span className={"text-xs font-semibold " + (market.resolved ? "text-terminal-dim" : "text-terminal-green")}>
          [{market.resolved ? "RESOLVED" : "ACTIVE"}]
        </span>
      </div>
      <div className="text-terminal-text text-sm font-semibold mb-4 leading-relaxed min-h-10">
        {hovered && <span className="text-terminal-green">{">"} </span>}
        {market.question}
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-terminal-green glow-green">YES {pctYes}%</span>
          <span className="text-terminal-red">NO {pctNo}%</span>
        </div>
        <div className="h-2 bg-terminal-border flex overflow-hidden">
          <div className="bg-terminal-green transition-all duration-700" style={{ width: pctYes + "%" }} />
          <div className="bg-terminal-red   transition-all duration-700" style={{ width: pctNo  + "%" }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-terminal-dim">VOL: <span className="text-terminal-amber">{volume} USDC</span></span>
        <span className="text-terminal-cyan">[TRADE →]</span>
      </div>
    </div>
  )
}
'''

files['src/components/MarketDetail.jsx'] = '''import { useState } from "react"
export default function MarketDetail({ market, wallet, onBack }) {
  const [side, setSide]     = useState("YES")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("")
  const pctYes = Math.round((market.priceYes ?? 0.5) * 100)
  const pctNo  = 100 - pctYes
  const volume = market.totalVolume ? (Number(market.totalVolume) / 1e18).toFixed(0) : "0"

  const handleTrade = () => {
    if (!wallet) { setStatus("ERR: Wallet not connected"); return }
    if (!amount) { setStatus("ERR: Enter amount"); return }
    setStatus("> Submitting transaction to Arc Testnet...")
    setTimeout(() => setStatus("> Waiting for sub-second finality..."), 1200)
    setTimeout(() => setStatus("[OK] Trade confirmed! Check https://testnet.arcscan.app"), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-terminal-dim text-sm hover:text-terminal-green mb-6 flex items-center gap-2">
        ← BACK_TO_MARKETS
      </button>
      <div className="term-box-green p-5 mb-4">
        <div className="label-dim mb-2">MARKET DETAIL</div>
        <div className="text-terminal-text text-base font-semibold mb-4">{market.question}</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-terminal-bg p-3 border border-terminal-border">
            <div className="label-dim mb-1">YES PRICE</div>
            <div className="text-terminal-green text-3xl font-bold glow-green">{pctYes}%</div>
          </div>
          <div className="bg-terminal-bg p-3 border border-terminal-border">
            <div className="label-dim mb-1">NO PRICE</div>
            <div className="text-terminal-red text-3xl font-bold">{pctNo}%</div>
          </div>
        </div>
        <div className="h-3 bg-terminal-border flex overflow-hidden mb-4">
          <div className="bg-terminal-green" style={{ width: pctYes + "%" }} />
          <div className="bg-terminal-red"   style={{ width: pctNo  + "%" }} />
        </div>
        <div className="flex gap-6 text-xs text-terminal-dim">
          <span>VOLUME: <span className="text-terminal-amber">{volume} USDC</span></span>
          <span>STATUS: <span className="text-terminal-green">{market.resolved ? "RESOLVED" : "ACTIVE"}</span></span>
          <span>CHAIN: <span className="text-terminal-cyan">Arc Testnet</span></span>
        </div>
      </div>
      <div className="term-box p-5">
        <div className="label-dim mb-4">EXECUTE TRADE</div>
        <div className="flex gap-2 mb-4">
          {["YES","NO"].map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={"flex-1 py-2.5 text-sm font-bold tracking-widest border transition-all " + (
                side === s
                  ? (s === "YES" ? "bg-terminal-green text-terminal-bg border-terminal-green" : "bg-terminal-red text-terminal-bg border-terminal-red")
                  : "border-terminal-border text-terminal-dim hover:border-terminal-text"
              )}>
              BUY {s}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <div className="label-dim mb-2">AMOUNT (USDC)</div>
          <div className="flex items-center border border-terminal-border bg-terminal-bg">
            <span className="text-terminal-green px-3 text-lg">$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-terminal-text py-2.5 pr-3 outline-none text-sm font-mono" />
            <span className="text-terminal-dim px-3 text-xs">USDC</span>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {["10","50","100","500"].map(v => (
            <button key={v} onClick={() => setAmount(v)}
              className="text-xs border border-terminal-border text-terminal-dim px-3 py-1 hover:border-terminal-cyan hover:text-terminal-cyan transition-all">
              ${v}
            </button>
          ))}
        </div>
        <button onClick={handleTrade}
          className={"w-full py-3 font-bold tracking-widest text-sm border transition-all " + (
            side === "YES"
              ? "border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg"
              : "border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-terminal-bg"
          )}>
          EXECUTE_BUY_{side} →
        </button>
        {status && (
          <div className={"mt-3 text-xs font-mono " + (status.startsWith("ERR") ? "text-terminal-red" : "text-terminal-green")}>
            {status}{status.includes("...") && <span style={{animation:"blink 1s step-end infinite"}}>_</span>}
          </div>
        )}
      </div>
    </div>
  )
}
'''

files['src/components/AgentPanel.jsx'] = '''export default function AgentPanel() {
  const agents = [
    { name: "ALPHA-01", rep: 8420, jobs: 84, tier: "PLATINUM", vol: "142,500" },
    { name: "BETA-07",  rep: 6200, jobs: 62, tier: "GOLD",     vol: "89,300"  },
    { name: "GAMMA-03", rep: 4900, jobs: 49, tier: "SILVER",   vol: "54,100"  },
    { name: "DELTA-11", rep: 3100, jobs: 31, tier: "BRONZE",   vol: "28,700"  },
  ]
  const tc = t => ({ PLATINUM:"text-terminal-cyan", GOLD:"text-terminal-amber", SILVER:"text-terminal-text", BRONZE:"text-orange-400" }[t])
  return (
    <div className="space-y-4">
      <div className="term-box-cyan p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="label-cyan mb-1">AGENT REGISTRY — ERC-8004</div>
            <div className="text-terminal-text text-sm">Onchain AI agent identity + reputation</div>
          </div>
          <button className="btn-cyan text-xs">REGISTER_AGENT</button>
        </div>
      </div>
      <div className="term-box overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-2 border-b border-terminal-border text-xs text-terminal-dim">
          <span>AGENT_ID</span><span>TIER</span><span>REPUTATION</span><span>JOBS</span><span>VOLUME</span>
        </div>
        {agents.map((a,i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-terminal-border hover:bg-terminal-bg transition-colors cursor-pointer text-sm">
            <span className="text-terminal-green font-semibold">{a.name}</span>
            <span className={"text-xs font-bold " + tc(a.tier)}>[{a.tier}]</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-terminal-border">
                <div className="h-full bg-terminal-green" style={{ width: (a.rep/100)+"%" }} />
              </div>
              <span className="text-terminal-dim text-xs">{a.rep}</span>
            </div>
            <span className="text-terminal-amber">{a.jobs}</span>
            <span className="text-terminal-text">{a.vol}</span>
          </div>
        ))}
      </div>
      <div className="term-box p-4">
        <div className="label-amber mb-3">OPEN LIQUIDITY JOBS — ERC-8183</div>
        <div className="space-y-2">
          {[
            { market:"BTC > $100k?", liq:"500", pay:"25", rep:3000 },
            { market:"ETH > $5k?",   liq:"200", pay:"10", rep:2000 },
          ].map((j,i) => (
            <div key={i} className="flex items-center justify-between border border-terminal-border p-3 text-xs hover:border-terminal-amber transition-colors">
              <span className="text-terminal-text">{j.market}</span>
              <span className="text-terminal-dim">LP: <span className="text-terminal-cyan">{j.liq} USDC</span></span>
              <span className="text-terminal-dim">REWARD: <span className="text-terminal-green">{j.pay} USDC</span></span>
              <span className="text-terminal-dim">MIN_REP: <span className="text-terminal-amber">{j.rep}</span></span>
              <button className="btn-green text-xs py-1 px-2">ACCEPT</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
'''

files['src/components/Portfolio.jsx'] = '''export default function Portfolio({ wallet }) {
  if (!wallet) return (
    <div className="term-box p-12 text-center">
      <div className="text-terminal-dim text-sm mb-2">WALLET_NOT_CONNECTED</div>
      <div className="text-terminal-red text-xs">ERR: Connect wallet to view portfolio</div>
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="term-box-green p-4">
        <div className="label-green mb-1">PORTFOLIO</div>
        <div className="text-terminal-dim text-xs font-mono">{wallet}</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"OPEN_POSITIONS",  value:"0",         color:"text-terminal-green" },
          { label:"EARNED_TODAY",    value:"0.00 USDC", color:"text-terminal-amber" },
          { label:"TOTAL_CLAIMED",   value:"0.00 USDC", color:"text-terminal-cyan"  },
        ].map((s,i) => (
          <div key={i} className="term-box p-4 text-center">
            <div className="label-dim mb-2">{s.label}</div>
            <div className={"text-xl font-bold " + s.color}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="term-box p-4">
        <div className="label-dim mb-3">POSITIONS</div>
        <div className="text-terminal-dim text-sm text-center py-8">
          NO_POSITIONS_FOUND
          <div className="text-xs mt-1 text-terminal-border">Buy YES or NO on any market to see positions here</div>
        </div>
      </div>
      <div className="term-box p-4">
        <div className="label-amber mb-3">STREAMING INCOME — NanoPayments</div>
        <div className="text-terminal-dim text-sm text-center py-4">
          NO_ACTIVE_STREAMS
          <div className="text-xs mt-1 text-terminal-border">Add liquidity to markets to start earning per-second</div>
        </div>
      </div>
    </div>
  )
}
'''

files['src/App.jsx'] = '''import { useState, useEffect } from "react"
import BootSequence from "./components/BootSequence"
import Header from "./components/Header"
import MarketCard from "./components/MarketCard"
import MarketDetail from "./components/MarketDetail"
import AgentPanel from "./components/AgentPanel"
import Portfolio from "./components/Portfolio"

const MARKETS = [
  { address:"0x001", question:"Will BTC close above $100,000 on June 30, 2026?",    priceYes:0.65, resolved:false, totalVolume:"14200000000000000000000" },
  { address:"0x002", question:"Will ETH exceed $5,000 before July 2026?",           priceYes:0.42, resolved:false, totalVolume:"8900000000000000000000"  },
  { address:"0x003", question:"Will Arc Mainnet launch before Q4 2026?",            priceYes:0.78, resolved:false, totalVolume:"3100000000000000000000"  },
  { address:"0x004", question:"Will USDC market cap exceed $100B in 2026?",         priceYes:0.51, resolved:false, totalVolume:"5400000000000000000000"  },
  { address:"0x005", question:"Will Circle go public (IPO) before end of 2026?",   priceYes:0.61, resolved:false, totalVolume:"2800000000000000000000"  },
  { address:"0x006", question:"Will Bitcoin ETF AUM exceed $200B in 2026?",        priceYes:0.44, resolved:false, totalVolume:"6100000000000000000000"  },
]

export default function App() {
  const [booted,    setBooted]    = useState(false)
  const [wallet,    setWallet]    = useState(null)
  const [activeTab, setActiveTab] = useState("MARKETS")
  const [selected,  setSelected]  = useState(null)
  const [status,    setStatus]    = useState("SYSTEM_READY")
  const [time,      setTime]      = useState("")

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toISOString().replace("T"," ").slice(0,19)), 1000)
    return () => clearInterval(t)
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) { setStatus("ERR: No wallet. Install MetaMask or Rabby."); return }
    try {
      setStatus("> Requesting wallet access...")
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" })
      setWallet(account)
      setStatus("> Connected: " + account.slice(0,10) + "...")
      try {
        await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{ chainId:"0x4CFAC2" }] })
        setStatus("[OK] Switched to Arc Testnet")
      } catch(e) {
        await window.ethereum.request({ method:"wallet_addEthereumChain", params:[{
          chainId:"0x4CFAC2", chainName:"Arc Testnet",
          nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
          rpcUrls:["https://rpc.testnet.arc.network"],
          blockExplorerUrls:["https://testnet.arcscan.app"],
        }]})
        setStatus("[OK] Arc Testnet added and connected")
      }
    } catch(e) { setStatus("ERR: " + e.message) }
  }

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />

  return (
    <div className="min-h-screen bg-terminal-bg">
      <div className="scanline" />
      <Header wallet={wallet} onConnect={connectWallet}
        activeTab={activeTab} setActiveTab={t => { setActiveTab(t); setSelected(null) }} />
      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between text-xs text-terminal-dim mb-6 border-b border-terminal-border pb-3">
          <span className="cursor-blink">{status}</span>
          <span className="text-terminal-border">{time} UTC</span>
        </div>

        {activeTab === "MARKETS" && !selected && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-terminal-green text-sm font-semibold">
                ACTIVE_MARKETS <span className="text-terminal-dim">({MARKETS.length})</span>
              </div>
              <button className="btn-cyan text-xs">+ CREATE_MARKET</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MARKETS.map((m,i) => <MarketCard key={m.address} market={m} index={i+1} onSelect={setSelected} />)}
            </div>
          </div>
        )}

        {activeTab === "MARKETS" && selected && (
          <MarketDetail market={selected} wallet={wallet} onBack={() => setSelected(null)} />
        )}

        {activeTab === "AGENTS"    && <AgentPanel />}
        {activeTab === "PORTFOLIO" && <Portfolio wallet={wallet} />}
      </main>
      <footer className="border-t border-terminal-border px-6 py-3 text-xs text-terminal-dim flex justify-between mt-8">
        <span>ARCPREDIX PROTOCOL © 2026 — Built on Arc (Circle)</span>
        <span>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-terminal-cyan">EXPLORER ↗</a>
          {" | "}
          <a href="https://github.com/DikaCream/arcpredix" target="_blank" rel="noreferrer" className="hover:text-terminal-green">GITHUB ↗</a>
        </span>
      </footer>
    </div>
  )
}
'''

# Write all files
for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"✓ {path}")

print("\n>>> All files created! Run: npm run dev -- --host")

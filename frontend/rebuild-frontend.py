import os

files = {}

files['index.html'] = '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ArcPredix — Prediction Markets on Arc</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:"Inter",sans-serif; background:#F0F4FF; color:#1E293B; -webkit-font-smoothing:antialiased; }
      ::-webkit-scrollbar { width:4px; }
      ::-webkit-scrollbar-thumb { background:#C7D2FE; border-radius:4px; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'''

files['src/index.css'] = '''@import "tailwindcss";

:root {
  --primary:   #4F46E5;
  --primary2:  #7C3AED;
  --cyan:      #06B6D4;
  --success:   #10B981;
  --danger:    #EF4444;
  --warning:   #F59E0B;
  --bg:        #F0F4FF;
  --surface:   #FFFFFF;
  --border:    #E2E8F0;
  --text:      #1E293B;
  --muted:     #64748B;
  --light:     #F8FAFC;
}

* { box-sizing:border-box; }
body { background:var(--bg); color:var(--text); font-family:"Inter",sans-serif; min-height:100vh; }
input,button,select { font-family:"Inter",sans-serif; }
button { cursor:pointer; }
a { text-decoration:none; color:inherit; }

/* Gradient */
.grad-primary { background: linear-gradient(135deg, var(--primary), var(--primary2)); }
.grad-cyan    { background: linear-gradient(135deg, var(--cyan), var(--primary)); }
.grad-success { background: linear-gradient(135deg, #10B981, #06B6D4); }
.grad-danger  { background: linear-gradient(135deg, #EF4444, #F97316); }
.grad-text    { background: linear-gradient(135deg, var(--primary), var(--primary2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* Cards */
.card { background:var(--surface); border-radius:16px; border:1px solid var(--border); box-shadow:0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.04); }
.card-hover { transition:all 0.2s; }
.card-hover:hover { box-shadow:0 4px 24px rgba(79,70,229,0.12); transform:translateY(-2px); border-color:#C7D2FE; }

/* Buttons */
.btn-primary { background:linear-gradient(135deg,var(--primary),var(--primary2)); color:#fff; border:none; border-radius:12px; padding:10px 20px; font-weight:600; font-size:14px; transition:all 0.2s; box-shadow:0 4px 12px rgba(79,70,229,0.3); }
.btn-primary:hover { box-shadow:0 6px 20px rgba(79,70,229,0.4); transform:translateY(-1px); }
.btn-outline { background:transparent; color:var(--primary); border:1.5px solid var(--primary); border-radius:12px; padding:10px 20px; font-weight:600; font-size:14px; transition:all 0.2s; }
.btn-outline:hover { background:var(--primary); color:#fff; }
.btn-sm { padding:6px 14px; font-size:12px; border-radius:8px; }
.btn-success { background:linear-gradient(135deg,#10B981,#06B6D4); color:#fff; border:none; border-radius:12px; padding:12px 24px; font-weight:600; font-size:14px; transition:all 0.2s; box-shadow:0 4px 12px rgba(16,185,129,0.3); width:100%; }
.btn-success:hover { box-shadow:0 6px 20px rgba(16,185,129,0.4); }
.btn-danger  { background:linear-gradient(135deg,#EF4444,#F97316); color:#fff; border:none; border-radius:12px; padding:12px 24px; font-weight:600; font-size:14px; transition:all 0.2s; box-shadow:0 4px 12px rgba(239,68,68,0.3); width:100%; }
.btn-danger:hover { box-shadow:0 6px 20px rgba(239,68,68,0.4); }

/* Badges */
.badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.badge-active  { background:#D1FAE5; color:#065F46; }
.badge-testnet { background:#EDE9FE; color:#5B21B6; }
.badge-sold    { background:#FEE2E2; color:#991B1B; }
.badge-gold    { background:#FEF3C7; color:#92400E; }
.badge-plat    { background:#E0F2FE; color:#075985; }
.badge-silver  { background:#F1F5F9; color:#475569; }

/* Progress */
.progress-wrap { height:8px; background:#EEF2FF; border-radius:99px; overflow:hidden; }
.progress-yes  { height:100%; background:linear-gradient(90deg,#10B981,#06B6D4); border-radius:99px; transition:width 0.6s ease; }
.progress-no   { height:100%; background:linear-gradient(90deg,#EF4444,#F97316); border-radius:99px; transition:width 0.6s ease; float:right; }

/* Input */
.input-wrap { position:relative; }
.input-field { width:100%; border:1.5px solid var(--border); border-radius:12px; padding:12px 16px; font-size:14px; color:var(--text); background:var(--surface); outline:none; transition:border 0.2s; }
.input-field:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(79,70,229,0.1); }
.input-prefix { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted); font-weight:600; }
.input-field.has-prefix { padding-left:30px; }

/* Tabs */
.tab-bar { display:flex; background:var(--surface); border-radius:12px; padding:4px; border:1px solid var(--border); }
.tab-item { flex:1; padding:8px 12px; border-radius:8px; font-size:13px; font-weight:500; border:none; background:transparent; color:var(--muted); transition:all 0.15s; text-align:center; }
.tab-item.active { background:linear-gradient(135deg,var(--primary),var(--primary2)); color:#fff; box-shadow:0 2px 8px rgba(79,70,229,0.3); }

/* Bottom nav */
.bottom-nav { position:fixed; bottom:0; left:0; right:0; background:var(--surface); border-top:1px solid var(--border); display:flex; z-index:50; padding-bottom:env(safe-area-inset-bottom); box-shadow:0 -4px 20px rgba(0,0,0,0.06); }
.nav-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px 4px 8px; gap:3px; font-size:10px; font-weight:500; color:var(--muted); border:none; background:transparent; transition:color 0.15s; }
.nav-item.active { color:var(--primary); }
.nav-icon { width:22px; height:22px; }

/* Stat card */
.stat-card { background:var(--surface); border-radius:16px; padding:16px; border:1px solid var(--border); }
.stat-value { font-size:24px; font-weight:800; }
.stat-label { font-size:11px; color:var(--muted); font-weight:500; margin-top:2px; }

/* Table row */
.tbl-row { display:grid; align-items:center; padding:12px 16px; border-bottom:1px solid var(--border); transition:background 0.1s; }
.tbl-row:hover { background:#F8FAFC; }
.tbl-row:last-child { border-bottom:none; }
.tbl-head { display:grid; align-items:center; padding:10px 16px; background:#F8FAFC; font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid var(--border); border-radius:12px 12px 0 0; }

/* Quick amount btn */
.quick-btn { border:1.5px solid var(--border); background:var(--light); border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; color:var(--muted); transition:all 0.15s; }
.quick-btn:hover { border-color:var(--primary); color:var(--primary); background:#EEF2FF; }

/* Animations */
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
.fade-up { animation:fadeUp 0.3s ease forwards; }
.pulse   { animation:pulse 2s ease infinite; }

/* Chip */
.chip { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:99px; font-size:12px; font-weight:500; border:1.5px solid var(--border); color:var(--muted); background:var(--surface); cursor:pointer; transition:all 0.15s; }
.chip:hover,.chip.active { border-color:var(--primary); color:var(--primary); background:#EEF2FF; }

/* Toast */
.toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:var(--text); color:#fff; padding:10px 20px; border-radius:12px; font-size:13px; font-weight:500; z-index:100; white-space:nowrap; box-shadow:0 8px 32px rgba(0,0,0,0.2); animation:fadeUp 0.3s ease; }
.toast.success { background:linear-gradient(135deg,#10B981,#06B6D4); }
.toast.error   { background:linear-gradient(135deg,#EF4444,#F97316); }

/* Divider */
.divider { height:1px; background:var(--border); margin:16px 0; }

/* Avatar */
.avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:#fff; flex-shrink:0; }

@media(max-width:640px) {
  .hide-mobile { display:none !important; }
}
'''

files['src/main.jsx'] = '''import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
'''

files['src/config/contracts.js'] = '''export const CONTRACTS = {
  USDC:     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  REGISTRY: "0xe135Cc4b11230f1665C997e823876ffC3533B062",
  FACTORY:  "0xdBEBA0dD610AC969161C3144974690E8fC29812F",
  JOBBOARD: "0x0b83dE45d737CD52a2237E53a169C3f4fB7ACF91",
  STREAMER: "0x6928D66A1CCE8a4cC934Ac2E4037612D1b260DE4",
}
export const ARC_CHAIN_ID = "0x4CFAC2"
export const ARC_RPC      = "https://rpc.testnet.arc.network"
export const ARC_EXPLORER = "https://testnet.arcscan.app"
'''

files['src/components/Header.jsx'] = '''export default function Header({ wallet, onConnect }) {
  const short = wallet ? wallet.slice(0,6)+"..."+wallet.slice(-4) : null
  return (
    <header style={{
      background:"#fff", borderBottom:"1px solid #E2E8F0", position:"sticky", top:0, zIndex:40,
      padding:"0 20px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between",
      boxShadow:"0 1px 8px rgba(79,70,229,0.06)"
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{
          width:32, height:32, borderRadius:10,
          background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, fontWeight:800, color:"#fff"
        }}>A</div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:"#1E293B" }}>ArcPredix</div>
          <div style={{ fontSize:10, color:"#94A3B8", marginTop:"-2px" }}>Prediction Markets</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <span className="badge badge-testnet">Arc Testnet</span>
        {wallet ? (
          <div style={{
            display:"flex", alignItems:"center", gap:"8px",
            background:"#F0F4FF", border:"1.5px solid #C7D2FE",
            borderRadius:12, padding:"6px 12px"
          }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", display:"inline-block" }} className="pulse" />
            <span style={{ fontSize:12, fontWeight:600, color:"#4F46E5" }}>{short}</span>
          </div>
        ) : (
          <button className="btn-primary btn-sm" onClick={onConnect}>Connect Wallet</button>
        )}
      </div>
    </header>
  )
}
'''

files['src/components/BottomNav.jsx'] = '''export default function BottomNav({ active, setActive }) {
  const items = [
    { id:"MARKETS",   label:"Markets",   icon:(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="nav-icon">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    )},
    { id:"AGENTS",    label:"Agents",    icon:(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="nav-icon">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    )},
    { id:"PORTFOLIO", label:"Portfolio", icon:(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="nav-icon">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    )},
  ]
  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={"nav-item"+(active===item.id?" active":"")}
          onClick={() => setActive(item.id)}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
'''

files['src/components/MarketCard.jsx'] = '''export default function MarketCard({ market, index, onSelect }) {
  const pctYes = Math.round((market.priceYes??0.5)*100)
  const pctNo  = 100 - pctYes
  const vol    = market.totalVolume
    ? Number((Number(market.totalVolume)/1e18).toFixed(0)).toLocaleString()
    : "0"

  const cats = ["Crypto","Finance","Technology","Macro","Circle"]
  const colors = [
    ["#EEF2FF","#4F46E5"],["#F0FDF4","#16A34A"],
    ["#FFF7ED","#EA580C"],["#FDF4FF","#9333EA"],["#E0F2FE","#0369A1"]
  ]
  const [bg, fg] = colors[index % colors.length]

  return (
    <div className="card card-hover fade-up" style={{ padding:"18px", cursor:"pointer" }}
      onClick={() => onSelect(market)}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <span style={{ background:bg, color:fg, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:600 }}>
          {cats[index % cats.length]}
        </span>
        <span className={"badge "+(market.resolved?"badge-sold":"badge-active")}>
          {market.resolved ? "Resolved" : "● Live"}
        </span>
      </div>

      <div style={{ fontSize:14, fontWeight:600, color:"#1E293B", lineHeight:1.5, marginBottom:14, minHeight:42 }}>
        {market.question}
      </div>

      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", display:"inline-block" }}/>
            <span style={{ fontSize:13, fontWeight:700, color:"#065F46" }}>YES {pctYes}%</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#991B1B" }}>NO {pctNo}%</span>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444", display:"inline-block" }}/>
          </div>
        </div>
        <div className="progress-wrap" style={{ position:"relative" }}>
          <div className="progress-yes" style={{ width:pctYes+"%", position:"absolute", left:0 }} />
          <div style={{ height:8, background:"linear-gradient(90deg,#EF4444,#F97316)", borderRadius:99, width:pctNo+"%", position:"absolute", right:0, transition:"width 0.6s ease" }} />
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:12, color:"#64748B" }}>
          Vol: <span style={{ fontWeight:600, color:"#1E293B" }}>${vol} USDC</span>
        </div>
        <button className="btn-outline btn-sm" style={{ fontSize:11 }}>Trade →</button>
      </div>
    </div>
  )
}
'''

files['src/components/MarketDetail.jsx'] = '''import { useState } from "react"

export default function MarketDetail({ market, wallet, onBack }) {
  const [side,   setSide]   = useState("YES")
  const [amount, setAmount] = useState("")
  const [toast,  setToast]  = useState(null)

  const pctYes = Math.round((market.priceYes??0.5)*100)
  const pctNo  = 100 - pctYes
  const vol    = market.totalVolume
    ? Number((Number(market.totalVolume)/1e18).toFixed(0)).toLocaleString()
    : "0"

  const showToast = (msg, type="success") => {
    setToast({msg,type})
    setTimeout(() => setToast(null), 3000)
  }

  const execute = () => {
    if (!wallet)  { showToast("Please connect wallet first", "error"); return }
    if (!amount)  { showToast("Enter an amount", "error"); return }
    showToast("Submitting to Arc Testnet...", "success")
    setTimeout(() => showToast("✓ Trade confirmed on Arc!", "success"), 2500)
  }

  return (
    <div className="fade-up" style={{ paddingBottom:80 }}>
      {toast && <div className={"toast "+toast.type}>{toast.msg}</div>}

      <button onClick={onBack} style={{
        display:"flex", alignItems:"center", gap:6, color:"#64748B",
        fontSize:13, fontWeight:500, background:"none", border:"none",
        marginBottom:16, padding:0
      }}>
        ← Back to Markets
      </button>

      {/* Market info card */}
      <div className="card" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span className="badge badge-active">● Live</span>
          <span style={{ fontSize:12, color:"#64748B" }}>Arc Testnet</span>
        </div>

        <div style={{ fontSize:16, fontWeight:700, color:"#1E293B", lineHeight:1.5, marginBottom:20 }}>
          {market.question}
        </div>

        {/* Price stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div style={{ background:"#F0FDF4", borderRadius:12, padding:"14px 16px", border:"1px solid #BBF7D0" }}>
            <div style={{ fontSize:11, color:"#6B7280", fontWeight:500, marginBottom:4 }}>YES PRICE</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#059669" }}>{pctYes}%</div>
          </div>
          <div style={{ background:"#FFF1F2", borderRadius:12, padding:"14px 16px", border:"1px solid #FECDD3" }}>
            <div style={{ fontSize:11, color:"#6B7280", fontWeight:500, marginBottom:4 }}>NO PRICE</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#DC2626" }}>{pctNo}%</div>
          </div>
        </div>

        <div className="progress-wrap" style={{ height:10, marginBottom:16, position:"relative" }}>
          <div className="progress-yes" style={{ width:pctYes+"%", height:"100%", position:"absolute", left:0 }} />
          <div style={{ height:10, background:"linear-gradient(90deg,#EF4444,#F97316)", borderRadius:99, width:pctNo+"%", position:"absolute", right:0, transition:"width 0.6s ease" }} />
        </div>

        <div style={{ display:"flex", gap:20, fontSize:12, color:"#64748B" }}>
          <span>Volume: <b style={{color:"#1E293B"}}>${vol} USDC</b></span>
          <span>Status: <b style={{color:"#059669"}}>Active</b></span>
          <span>Chain: <b style={{color:"#4F46E5"}}>Arc 5042002</b></span>
        </div>
      </div>

      {/* Trading panel */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Place Order</div>

        {/* Side selector */}
        <div className="tab-bar" style={{ marginBottom:16 }}>
          <button className={"tab-item"+(side==="YES"?" active":"")}
            onClick={()=>setSide("YES")}
            style={ side==="YES" ? {background:"linear-gradient(135deg,#10B981,#06B6D4)"} : {} }>
            Buy YES
          </button>
          <button className={"tab-item"+(side==="NO"?" active":"")}
            onClick={()=>setSide("NO")}
            style={ side==="NO" ? {background:"linear-gradient(135deg,#EF4444,#F97316)"} : {} }>
            Buy NO
          </button>
        </div>

        {/* Amount */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:6 }}>
            Amount (USDC)
          </label>
          <div className="input-wrap">
            <span className="input-prefix">$</span>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
              placeholder="0.00" className="input-field has-prefix" />
          </div>
        </div>

        {/* Quick amounts */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {["10","50","100","500"].map(v => (
            <button key={v} className="quick-btn" onClick={()=>setAmount(v)}>${v}</button>
          ))}
        </div>

        {/* Estimated shares */}
        {amount && (
          <div style={{
            background:"#F8FAFC", borderRadius:12, padding:"12px 16px", marginBottom:16,
            border:"1px solid #E2E8F0", fontSize:13
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:"#64748B" }}>Estimated shares</span>
              <span style={{ fontWeight:700 }}>~{(Number(amount) / (side==="YES" ? market.priceYes : 1-market.priceYes)).toFixed(2)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"#64748B" }}>Fee (0.5%)</span>
              <span style={{ fontWeight:600, color:"#64748B" }}>${(Number(amount)*0.005).toFixed(2)} USDC</span>
            </div>
          </div>
        )}

        <button
          className={side==="YES"?"btn-success":"btn-danger"}
          onClick={execute}>
          {side==="YES" ? "Buy YES →" : "Buy NO →"}
        </button>

        <div style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:10 }}>
          Powered by Arc Testnet · USDC Settlement · Sub-second Finality
        </div>
      </div>
    </div>
  )
}
'''

files['src/components/AgentPanel.jsx'] = '''export default function AgentPanel() {
  const agents = [
    { name:"ALPHA-01", rep:8420, jobs:84, tier:"PLATINUM", vol:"142,500", color:"#0369A1", bg:"#E0F2FE" },
    { name:"BETA-07",  rep:6200, jobs:62, tier:"GOLD",     vol:"89,300",  color:"#92400E", bg:"#FEF3C7" },
    { name:"GAMMA-03", rep:4900, jobs:49, tier:"SILVER",   vol:"54,100",  color:"#475569", bg:"#F1F5F9" },
    { name:"DELTA-11", rep:3100, jobs:31, tier:"BRONZE",   vol:"28,700",  color:"#92400E", bg:"#FFF7ED" },
  ]
  const jobs = [
    { market:"Will BTC exceed $100k?", liq:"500", pay:"25", rep:3000 },
    { market:"Will ETH exceed $5k?",   liq:"200", pay:"10", rep:2000 },
    { market:"Will Arc Mainnet launch?",liq:"100", pay:"5",  rep:1000 },
  ]

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:80 }}>

      {/* Header card */}
      <div className="card" style={{ padding:20, background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:4 }}>Agent Registry</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>ERC-8004 · Onchain AI identity</div>
          </div>
          <button style={{
            background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.3)",
            borderRadius:12, padding:"8px 16px", color:"#fff", fontSize:13, fontWeight:600,
            backdropFilter:"blur(8px)"
          }}>+ Register</button>
        </div>
      </div>

      {/* Agents list */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #E2E8F0", fontSize:14, fontWeight:700 }}>
          Top Agents
        </div>
        {agents.map((a,i) => (
          <div key={i} className="tbl-row" style={{ gridTemplateColumns:"auto 1fr auto", gap:14, alignItems:"center" }}>
            <div className="avatar" style={{ background:`linear-gradient(135deg,${a.bg},${a.color})`, color:a.color }}>
              {a.name[0]}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1E293B" }}>{a.name}</div>
              <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{a.jobs} jobs · ${a.vol} vol</div>
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, background:"#EEF2FF", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:(a.rep/100)+"%", background:"linear-gradient(90deg,#4F46E5,#7C3AED)", borderRadius:99, transition:"width 0.6s" }} />
                </div>
              </div>
            </div>
            <span style={{ background:a.bg, color:a.color, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700 }}>
              {a.tier}
            </span>
          </div>
        ))}
      </div>

      {/* Open jobs */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700 }}>Liquidity Jobs</div>
          <span style={{ fontSize:11, color:"#64748B" }}>ERC-8183 Escrow</span>
        </div>
        {jobs.map((j,i) => (
          <div key={i} style={{ padding:"14px 20px", borderBottom: i<jobs.length-1?"1px solid #E2E8F0":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#1E293B", marginBottom:4 }}>{j.market}</div>
              <div style={{ fontSize:11, color:"#64748B", display:"flex", gap:12 }}>
                <span>LP: <b>{j.liq} USDC</b></span>
                <span>Reward: <b style={{color:"#059669"}}>{j.pay} USDC</b></span>
                <span>Min Rep: <b>{j.rep}</b></span>
              </div>
            </div>
            <button className="btn-outline btn-sm">Accept</button>
          </div>
        ))}
      </div>

    </div>
  )
}
'''

files['src/components/Portfolio.jsx'] = '''export default function Portfolio({ wallet }) {
  if (!wallet) return (
    <div style={{ paddingBottom:80 }}>
      <div className="card" style={{ padding:40, textAlign:"center" }}>
        <div style={{
          width:64, height:64, borderRadius:20, background:"#EEF2FF",
          margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth={2}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Connect Wallet</div>
        <div style={{ fontSize:13, color:"#64748B", marginBottom:20 }}>
          Connect your wallet to view your portfolio
        </div>
        <div style={{ fontSize:11, color:"#94A3B8" }}>
          Arc Testnet · Chain ID 5042002
        </div>
      </div>
    </div>
  )

  const stats = [
    { label:"Open Positions",  value:"0",         color:"#4F46E5", bg:"#EEF2FF" },
    { label:"P&L Today",       value:"+$0.00",     color:"#059669", bg:"#F0FDF4" },
    { label:"Total Claimed",   value:"$0.00",      color:"#0369A1", bg:"#E0F2FE" },
  ]

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:80 }}>
      {/* Wallet card */}
      <div className="card" style={{ padding:20, background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>Connected Wallet</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#fff", wordBreak:"break-all" }}>{wallet}</div>
        <div style={{ marginTop:12, display:"flex", gap:8 }}>
          <span style={{ background:"rgba(255,255,255,0.15)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#fff" }}>
            Arc Testnet
          </span>
          <span style={{ background:"rgba(255,255,255,0.15)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#fff" }}>
            USDC Gas
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {stats.map((s,i) => (
          <div key={i} className="stat-card" style={{ background:s.bg, border:"none" }}>
            <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Positions */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>My Positions</div>
        <div style={{ textAlign:"center", padding:"32px 0", color:"#94A3B8" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>📊</div>
          <div style={{ fontSize:13, fontWeight:600, color:"#64748B" }}>No positions yet</div>
          <div style={{ fontSize:12, marginTop:4 }}>Trade a market to see positions here</div>
        </div>
      </div>

      {/* Streaming */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700 }}>Streaming Income</div>
          <span style={{ fontSize:11, color:"#64748B" }}>NanoPayments</span>
        </div>
        <div style={{ textAlign:"center", padding:"24px 0", color:"#94A3B8" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>⚡</div>
          <div style={{ fontSize:13, fontWeight:600, color:"#64748B" }}>No active streams</div>
          <div style={{ fontSize:12, marginTop:4 }}>Add LP to a market to earn per-second</div>
        </div>
      </div>
    </div>
  )
}
'''

files['src/App.jsx'] = '''import { useState, useEffect } from "react"
import Header from "./components/Header"
import BottomNav from "./components/BottomNav"
import MarketCard from "./components/MarketCard"
import MarketDetail from "./components/MarketDetail"
import AgentPanel from "./components/AgentPanel"
import Portfolio from "./components/Portfolio"

const MARKETS = [
  { address:"0x001", question:"Will BTC close above $100,000 on June 30, 2026?",   priceYes:0.65, resolved:false, totalVolume:"14200000000000000000000" },
  { address:"0x002", question:"Will ETH exceed $5,000 before July 2026?",          priceYes:0.42, resolved:false, totalVolume:"8900000000000000000000"  },
  { address:"0x003", question:"Will Arc Mainnet launch before Q4 2026?",           priceYes:0.78, resolved:false, totalVolume:"3100000000000000000000"  },
  { address:"0x004", question:"Will USDC market cap exceed $100B in 2026?",        priceYes:0.51, resolved:false, totalVolume:"5400000000000000000000"  },
  { address:"0x005", question:"Will Circle go public (IPO) before end of 2026?",  priceYes:0.61, resolved:false, totalVolume:"2800000000000000000000"  },
  { address:"0x006", question:"Will Bitcoin ETF AUM exceed $200B in 2026?",       priceYes:0.44, resolved:false, totalVolume:"6100000000000000000000"  },
]

export default function App() {
  const [wallet,    setWallet]    = useState(null)
  const [activeTab, setActiveTab] = useState("MARKETS")
  const [selected,  setSelected]  = useState(null)
  const [filter,    setFilter]    = useState("All")

  const connectWallet = async () => {
    if (!window.ethereum) { alert("Install MetaMask or Rabby to continue"); return }
    try {
      const [acct] = await window.ethereum.request({ method:"eth_requestAccounts" })
      setWallet(acct)
      try {
        await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{chainId:"0x4CFAC2"}] })
      } catch {
        await window.ethereum.request({ method:"wallet_addEthereumChain", params:[{
          chainId:"0x4CFAC2", chainName:"Arc Testnet",
          nativeCurrency:{name:"USDC",symbol:"USDC",decimals:18},
          rpcUrls:["https://rpc.testnet.arc.network"],
          blockExplorerUrls:["https://testnet.arcscan.app"],
        }]})
      }
    } catch(e) { console.error(e) }
  }

  const filters = ["All","Crypto","Finance","Technology","Macro"]

  return (
    <div style={{ minHeight:"100vh", background:"#F0F4FF" }}>
      <Header wallet={wallet} onConnect={connectWallet} />

      <main style={{ maxWidth:640, margin:"0 auto", padding:"16px 16px 0" }}>

        {activeTab==="MARKETS" && !selected && (
          <div>
            {/* Hero */}
            <div className="card" style={{
              padding:24, marginBottom:16,
              background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
              border:"none"
            }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:6 }}>
                Prediction Markets
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginBottom:16, lineHeight:1.5 }}>
                Trade YES or NO on real-world outcomes.<br/>
                Instant settlement on Arc · Powered by USDC
              </div>
              <div style={{ display:"flex", gap:16 }}>
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 16px" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{MARKETS.length}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Active Markets</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 16px" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>$42.5K</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Total Volume</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 16px" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>USDC</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Native Gas</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
              {filters.map(f => (
                <button key={f} className={"chip"+(filter===f?" active":"")}
                  onClick={() => setFilter(f)} style={{ whiteSpace:"nowrap" }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Market grid */}
            <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:80 }}>
              {MARKETS.map((m,i) => (
                <MarketCard key={m.address} market={m} index={i} onSelect={setSelected} />
              ))}
            </div>
          </div>
        )}

        {activeTab==="MARKETS" && selected && (
          <MarketDetail market={selected} wallet={wallet} onBack={()=>setSelected(null)} />
        )}

        {activeTab==="AGENTS"    && <AgentPanel />}
        {activeTab==="PORTFOLIO" && <Portfolio wallet={wallet} />}

      </main>

      <BottomNav active={activeTab} setActive={t=>{setActiveTab(t);setSelected(null)}} />
    </div>
  )
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"✓ {path}")

print("\nDone! Run: npm run dev -- --host")

import { useState, useEffect } from "react"
import { CONTRACTS } from "./config/contracts"
import { MARKETS } from "./config/markets"
import { useMarketData } from "./hooks/useMarketData"
import Header            from "./components/Header"
import BottomNav         from "./components/BottomNav"
import Sidebar           from "./components/Sidebar"
import MarketCard        from "./components/MarketCard"
import MarketDetail      from "./components/MarketDetail"
import AgentPanel        from "./components/AgentPanel"
import Portfolio         from "./components/Portfolio"
import CreateMarketModal from "./components/CreateMarketModal"

export { MARKETS, CONTRACTS }

export default function App() {
  const [wallet,       setWallet]       = useState(null)
  const [activeTab,    setActiveTab]    = useState("MARKETS")
  const [selected,     setSelected]     = useState(null)
  const [filter,       setFilter]       = useState("All")
  const [darkMode,     setDarkMode]     = useState(false)
  const [showCreate,   setShowCreate]   = useState(false)

  const { marketData, loading:priceLoading, refresh } = useMarketData()

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light")
  }, [darkMode])

  const connectWallet = async () => {
    if (!window.ethereum) { alert("Install MetaMask or Rabby"); return }
    try {
      const [acct] = await window.ethereum.request({ method:"eth_requestAccounts" })
      setWallet(acct)
      try {
        await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{chainId:"0x4CEF52"}] })
      } catch {
        await window.ethereum.request({ method:"wallet_addEthereumChain", params:[{
          chainId:"0x4CEF52", chainName:"Arc Testnet",
          nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
          rpcUrls:["https://rpc.testnet.arc.network"],
          blockExplorerUrls:["https://testnet.arcscan.app"],
        }]})
      }
    } catch(e) { console.error(e) }
  }

  const switchTab = (tab) => { setActiveTab(tab); setSelected(null) }

  return (
    <div className="app-layout" style={{ background:"var(--bg)", minHeight:"100vh" }}>

      <aside className="sidebar">
        <Sidebar activeTab={activeTab} setActiveTab={switchTab}
          wallet={wallet} onConnect={connectWallet}
          darkMode={darkMode} toggleDark={()=>setDarkMode(d=>!d)} />
      </aside>

      <div className="main-content">
        <Header wallet={wallet} onConnect={connectWallet}
          darkMode={darkMode} toggleDark={()=>setDarkMode(d=>!d)} />

        <div className="page-container">

          {activeTab==="MARKETS" && !selected && (
            <div>
              <div className="card" style={{ padding:24, marginBottom:16,
                background:"linear-gradient(135deg,#4F46E5,#7C3AED)", border:"none" }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:6 }}>
                  Prediction Markets
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginBottom:16, lineHeight:1.5 }}>
                  Trade YES or NO on real-world outcomes.<br/>
                  Instant settlement on Arc · Powered by USDC
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {[
                    { v:MARKETS.length, l:"Live Markets" },
                    { v:"$42.5K",       l:"Volume"       },
                    { v:"USDC",         l:"Gas Token"    },
                  ].map((s,i) => (
                    <div key={i} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 16px" }}>
                      <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{s.v}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, gap:12 }}>
                <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, flex:1 }}>
                  {["All","Crypto","Finance","Technology","Macro"].map(f => (
                    <button key={f} className={"chip"+(filter===f?" active":"")}
                      onClick={()=>setFilter(f)}>{f}</button>
                  ))}
                </div>
                <button className="btn-primary btn-sm" onClick={()=>setShowCreate(true)}
                  style={{ whiteSpace:"nowrap", flexShrink:0 }}>
                  + Create
                </button>
              </div>

              {priceLoading && (
                <div style={{ textAlign:"center", fontSize:12, color:"var(--muted)", marginBottom:12 }}>
                  Fetching live prices...
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                {MARKETS.map((m,i) => (
                  <div key={m.address} style={{ position:"relative" }}>
                    <div style={{ position:"absolute", top:-6, left:12, zIndex:1,
                      background:"linear-gradient(135deg,#10B981,#06B6D4)",
                      color:"#fff", fontSize:9, fontWeight:700,
                      padding:"2px 8px", borderRadius:99 }}>LIVE ON-CHAIN</div>
                    <MarketCard
                      market={m} index={i}
                      onSelect={setSelected}
                      liveData={marketData[m.address]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="MARKETS" && selected && (
            <MarketDetail
              market={selected}
              wallet={wallet}
              onBack={()=>setSelected(null)}
              liveData={marketData[selected.address]}
            />
          )}

          {activeTab==="AGENTS"    && <AgentPanel wallet={wallet} />}
          {activeTab==="PORTFOLIO" && <Portfolio  wallet={wallet} />}

        </div>
      </div>

      <BottomNav active={activeTab} setActive={switchTab} />

      {showCreate && (
        <CreateMarketModal
          wallet={wallet}
          onClose={()=>setShowCreate(false)}
          onCreated={()=>{ refresh(); setShowCreate(false) }}
        />
      )}
    </div>
  )
}

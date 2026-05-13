export default function Sidebar({ activeTab, setActiveTab, wallet, onConnect, darkMode, toggleDark }) {
  const short = wallet ? wallet.slice(0,6)+"..."+wallet.slice(-4) : null

  const tabs = [
    { id:"MARKETS",   label:"Markets",   icon:"📈" },
    { id:"AGENTS",    label:"Agents",    icon:"🤖" },
    { id:"PORTFOLIO", label:"Portfolio", icon:"💼" },
  ]

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Logo */}
      <div style={{ marginBottom:24, padding:"4px 0" }}>
        <div style={{ fontSize:18, fontWeight:800, color:"var(--text)" }}>ArcPredix</div>
        <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>Prediction Markets</div>
      </div>

      {/* Nav */}
      <nav className="desktop-nav" style={{ flex:1 }}>
        {tabs.map(t => (
          <button key={t.id}
            className={"desktop-nav-item"+(activeTab===t.id?" active":"")}
            onClick={()=>setActiveTab(t.id)}>
            <span style={{ fontSize:16 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop:"1px solid var(--border)", paddingTop:16, display:"flex", flexDirection:"column", gap:10 }}>

        {/* Dark mode toggle */}
        <button onClick={toggleDark} style={{
          display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
          borderRadius:12, border:"1px solid var(--border)", background:"var(--light)",
          color:"var(--text)", cursor:"pointer", fontSize:13, fontWeight:500,
          transition:"all 0.15s", width:"100%"
        }}>
          <span>{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Wallet */}
        {wallet ? (
          <div style={{ background:"var(--light)", border:"1px solid var(--border)", borderRadius:12, padding:"10px 14px" }}>
            <div style={{ fontSize:10, color:"var(--muted)", marginBottom:4 }}>Connected</div>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--primary)", wordBreak:"break-all" }}>{short}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", display:"inline-block" }}/>
              <span style={{ fontSize:10, color:"var(--muted)" }}>Arc Testnet</span>
            </div>
          </div>
        ) : (
          <button className="btn-primary" onClick={onConnect} style={{ width:"100%" }}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  )
}

export default function Header({ wallet, onConnect, darkMode, toggleDark }) {
  const short = wallet ? wallet.slice(0,6)+"..."+wallet.slice(-4) : null
  return (
    <header style={{
      background:"var(--surface)", borderBottom:"1px solid var(--border)",
      position:"sticky", top:0, zIndex:40,
      padding:"0 20px", height:"60px",
      display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center",
      boxShadow:"0 1px 8px rgba(0,0,0,0.06)"
    }}>
      <div/>
      <div style={{ fontWeight:800, fontSize:16, color:"var(--text)", textAlign:"center" }}>
        ArcPredix
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"flex-end" }}>
        {/* Dark mode toggle — mobile only */}
        <button onClick={toggleDark} style={{
          background:"var(--light)", border:"1px solid var(--border)",
          borderRadius:10, padding:"6px 10px", fontSize:16,
          cursor:"pointer", lineHeight:1
        }}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        <span className="badge badge-testnet">Arc Testnet</span>

        {wallet ? (
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"var(--light)", border:"1.5px solid #C7D2FE",
            borderRadius:12, padding:"6px 12px"
          }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#10B981",
              display:"inline-block", animation:"pulse 2s ease infinite" }} />
            <span style={{ fontSize:12, fontWeight:600, color:"var(--primary)" }}>{short}</span>
          </div>
        ) : (
          <button className="btn-primary btn-sm" onClick={onConnect}>Connect Wallet</button>
        )}
      </div>
    </header>
  )
}

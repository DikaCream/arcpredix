export default function Header({ wallet, onConnect, darkMode, toggleDark }) {
  const short = wallet ? wallet.slice(0,6)+"..."+wallet.slice(-4) : null
  return (
    <header style={{
      background:"var(--surface)", borderBottom:"1px solid var(--border)",
      position:"sticky", top:0, zIndex:40, padding:"0 16px", height:"56px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      boxShadow:"0 1px 8px rgba(0,0,0,0.06)"
    }}>
      {/* Left: Logo + Name */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:8,
          background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, flexShrink:0 }}>👾</div>
        <span style={{ fontWeight:800, fontSize:15, color:"var(--text)" }}>ArcPredix</span>
      </div>

      {/* Right: dark toggle + wallet */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={toggleDark} style={{
          background:"var(--light)", border:"1px solid var(--border)",
          borderRadius:8, width:32, height:32, fontSize:14,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"
        }}>{darkMode ? "☀️" : "🌙"}</button>

        {wallet ? (
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background:"var(--light)", border:"1.5px solid #C7D2FE",
            borderRadius:10, padding:"5px 10px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#10B981",
              display:"inline-block", flexShrink:0 }} />
            <span style={{ fontSize:12, fontWeight:600, color:"var(--primary)" }}>{short}</span>
          </div>
        ) : (
          <button className="btn-primary" onClick={onConnect}
            style={{ padding:"7px 14px", fontSize:13, borderRadius:10 }}>
            Connect
          </button>
        )}
      </div>
    </header>
  )
}

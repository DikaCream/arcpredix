export default function CreatorPanel() {
  const creators = [
    { name: "Creator Alpha", followers: "125K", tasks: 42, tier: "PLATINUM", earned: "$12,450", color: "#8b5cf6" },
    { name: "Creator Beta", followers: "89K", tasks: 31, tier: "GOLD", earned: "$8,320", color: "#f59e0b" },
    { name: "Creator Gamma", followers: "45K", tasks: 28, tier: "SILVER", earned: "$5,100", color: "#6b7280" },
    { name: "Creator Delta", followers: "22K", tasks: 15, tier: "BRONZE", earned: "$2,800", color: "#cd7f32" },
  ]

  const openJobs = [
    { task: "Promote AiToEarn on Instagram", budget: "500", pay: "25", minFollowers: "10K" },
    { task: "YouTube review video", budget: "200", pay: "10", minFollowers: "5K" },
    { task: "Threads engagement campaign", budget: "100", pay: "5", minFollowers: "1K" },
  ]

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="glass-strong" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="lbl c-primary" style={{ marginBottom: "4px" }}>CREATOR REGISTRY</div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Verified creator identity + performance tracking</div>
          </div>
          <button className="btn btn-primary">+ Register</button>
        </div>
      </div>

      <div className="glass">
        <div className="tbl-head" style={{ gridTemplateColumns: "2fr 1.5fr 2fr 1fr 2fr", padding: "14px 20px" }}>
          <span>CREATOR</span><span>TIER</span><span>FOLLOWERS</span><span>TASKS</span><span>EARNED</span>
        </div>
        {creators.map((c, i) => (
          <div key={i} className="tbl-row" style={{ gridTemplateColumns: "2fr 1.5fr 2fr 1fr 2fr", alignItems: "center" }}>
            <span style={{ color: "#1e1b4b", fontWeight: 700 }}>{c.name}</span>
            <span className="badge" style={{
              background: c.color + "15", color: c.color,
              fontSize: "10px", padding: "3px 10px"
            }}>[{c.tier}]</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, height: "6px", background: "rgba(139, 92, 246, 0.1)", borderRadius: "10px" }}>
                <div style={{
                  height: "100%", background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                  width: (parseInt(c.followers) / 150) + "%", borderRadius: "10px"
                }} />
              </div>
              <span className="c-dim" style={{ fontSize: "12px", minWidth: "50px" }}>{c.followers}</span>
            </div>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>{c.tasks}</span>
            <span style={{ color: "#1e1b4b", fontWeight: 700 }}>{c.earned}</span>
          </div>
        ))}
      </div>

      <div className="glass-strong" style={{ padding: "24px" }}>
        <div className="lbl c-accent" style={{ marginBottom: "16px" }}>OPEN CREATOR JOBS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {openJobs.map((j, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "12px", padding: "14px 18px", fontSize: "13px",
              border: "1px solid rgba(139, 92, 246, 0.1)",
              transition: "all 0.2s", cursor: "pointer"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "white"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.1)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.5)"
              e.currentTarget.style.boxShadow = "none"
            }}>
              <span style={{ color: "#1e1b4b", fontWeight: 600, flex: 1 }}>{j.task}</span>
              <span style={{ color: "#6b7280", marginRight: "20px" }}>
                Budget: <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{j.budget} USDC</span>
              </span>
              <span style={{ color: "#6b7280", marginRight: "20px" }}>
                Pay: <span style={{ color: "#10b981", fontWeight: 600 }}>{j.pay} USDC</span>
              </span>
              <span style={{ color: "#6b7280", marginRight: "20px" }}>
                Min: <span style={{ color: "#f59e0b", fontWeight: 600 }}>{j.minFollowers}</span>
              </span>
              <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "11px" }}>
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

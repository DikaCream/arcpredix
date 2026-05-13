export default function Earnings({ wallet }) {
  if (!wallet) return (
    <div className="glass" style={{ padding: "64px", textAlign: "center" }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "20px",
        background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: "28px"
      }}>$</div>
      <div style={{ color: "#6b7280", fontSize: "16px", marginBottom: "8px", fontWeight: 600 }}>
        Wallet Not Connected
      </div>
      <div style={{ color: "#9ca3af", fontSize: "14px" }}>
        Connect your wallet to view earnings and task history
      </div>
    </div>
  )

  const stats = [
    { label: "ACTIVE TASKS", value: "0", color: "#8b5cf6", icon: "T" },
    { label: "EARNED TODAY", value: "$0.00", color: "#f59e0b", icon: "$" },
    { label: "TOTAL EARNED", value: "$0.00", color: "#10b981", icon: "W" },
  ]

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="glass-strong" style={{ padding: "24px" }}>
        <div className="lbl c-primary" style={{ marginBottom: "4px" }}>MY EARNINGS</div>
        <div style={{ color: "#6b7280", fontSize: "13px", fontFamily: "monospace" }}>{wallet}</div>
      </div>

      <div className="grid-3">
        {stats.map((s, i) => (
          <div key={i} className="glass" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: s.color + "15", color: s.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", fontSize: "20px", fontWeight: 800
            }}>{s.icon}</div>
            <div className="lbl c-dim" style={{ marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: "24px" }}>
        <div className="lbl c-dim" style={{ marginBottom: "16px" }}>TASK HISTORY</div>
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "24px",
            background: "rgba(139, 92, 246, 0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "36px"
          }}>T</div>
          <div style={{ fontSize: "15px", color: "#6b7280", fontWeight: 600, marginBottom: "6px" }}>
            No Tasks Yet
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Accept tasks from the marketplace to start earning
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: "24px" }}>
        <div className="lbl c-accent" style={{ marginBottom: "16px" }}>PAYMENT STREAMS</div>
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "24px",
            background: "rgba(245, 158, 11, 0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "36px"
          }}>$</div>
          <div style={{ fontSize: "15px", color: "#6b7280", fontWeight: 600, marginBottom: "6px" }}>
            No Active Streams
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Complete tasks to unlock recurring payment streams
          </div>
        </div>
      </div>
    </div>
  )
}

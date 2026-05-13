import { useState } from "react"

const PLATFORM_STYLES = {
  instagram: { bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", icon: "IG", name: "Instagram" },
  youtube:   { bg: "#ff0000", icon: "YT", name: "YouTube" },
  threads:   { bg: "#000000", icon: "TH", name: "Threads" },
  twitter:   { bg: "#000000", icon: "X", name: "X/Twitter" },
  tiktok:    { bg: "#000000", icon: "TT", name: "TikTok" },
}

export default function TaskDetail({ task, wallet, onBack }) {
  const [status, setStatus] = useState(null)
  const platform = task.platform || "instagram"
  const style = PLATFORM_STYLES[platform] || PLATFORM_STYLES.instagram

  const acceptTask = () => {
    if (!wallet) { setStatus({ t: "err", m: "Please connect your wallet first" }); return }
    setStatus({ t: "ok", m: "Submitting task acceptance..." })
    setTimeout(() => setStatus({ t: "done", m: "Task accepted! Check your dashboard." }), 1500)
  }

  return (
    <div className="fade-in" style={{ maxWidth: "680px", margin: "0 auto" }}>
      <button
        onClick={onBack}
        className="btn btn-ghost"
        style={{ marginBottom: "20px", padding: "8px 16px" }}
      >
        &larr; Back to Tasks
      </button>

      <div className="glass-strong" style={{ padding: "28px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "20px",
            background: style.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", color: "white", fontWeight: 800,
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
          }}>
            {style.icon}
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}>
              {style.name}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e1b4b", lineHeight: 1.3 }}>
              {task.name}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <span className={"badge " + (
            task.type === "CPE" ? "badge-cpe" :
            task.type === "CPM" ? "badge-cpm" :
            task.type === "PINNED" ? "badge-pinned" :
            "badge-cpe"
          )} style={{ fontSize: "12px", padding: "6px 14px" }}>
            {task.type || "CPE"} Task
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div className="glass" style={{ padding: "20px", textAlign: "center" }}>
            <div className="lbl c-dim" style={{ marginBottom: "8px" }}>PAYMENT</div>
            <div className="price-tag" style={{ fontSize: "32px" }}>{task.price}</div>
            <div className="price-unit">{task.priceUnit}</div>
          </div>
          <div className="glass" style={{ padding: "20px", textAlign: "center" }}>
            <div className="lbl c-dim" style={{ marginBottom: "8px" }}>MAX EARN</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#ec4899" }}>
              {task.maxEarn || "$20,000"}
            </div>
            <div className="price-unit">per post</div>
          </div>
        </div>

        <div style={{
          background: "rgba(139, 92, 246, 0.05)",
          borderRadius: "12px", padding: "16px", marginBottom: "20px",
          border: "1px solid rgba(139, 92, 246, 0.1)"
        }}>
          <div className="lbl c-primary" style={{ marginBottom: "8px" }}>DESCRIPTION</div>
          <div style={{ color: "#4b5563", fontSize: "14px", lineHeight: 1.6 }}>
            {task.description}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div className="lbl c-dim" style={{ marginBottom: "12px" }}>REQUIREMENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(task.requirements || ["Minimum 1,000 followers", "Active account", "Public profile"]).map((req, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                fontSize: "13px", color: "#4b5563"
              }}>
                <span style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.1)", color: "#10b981",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, flexShrink: 0
                }}>v</span>
                {req}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", fontSize: "13px", marginBottom: "20px" }}>
          <span className="c-dim">Status: <span className="c-success" style={{ fontWeight: 600 }}> Active</span></span>
          <span className="c-dim">Slots: <span style={{ color: "#1e1b4b", fontWeight: 600 }}>{task.slots || "1/1"}</span></span>
          <span className="c-dim">Platform: <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{style.name}</span></span>
        </div>
      </div>

      <div className="glass" style={{ padding: "24px" }}>
        <div className="lbl c-dim" style={{ marginBottom: "16px" }}>ACCEPT TASK</div>
        <button
          onClick={acceptTask}
          className="btn btn-primary"
          style={{ width: "100%", padding: "16px", fontSize: "15px", justifyContent: "center" }}
        >
          Accept Task &rarr;
        </button>
        {status && (
          <div style={{
            marginTop: "16px", fontSize: "13px", padding: "12px 16px",
            borderRadius: "12px",
            background: status.t === "err" ? "rgba(239, 68, 68, 0.08)" :
                        status.t === "done" ? "rgba(16, 185, 129, 0.08)" :
                        "rgba(139, 92, 246, 0.08)",
            color: status.t === "err" ? "#ef4444" :
                   status.t === "done" ? "#10b981" :
                   "#8b5cf6",
            fontWeight: 600, textAlign: "center"
          }}>
            {status.m}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from "react"

const PLATFORM_STYLES = {
  instagram: { bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", icon: "IG" },
  youtube:   { bg: "#ff0000", icon: "YT" },
  threads:   { bg: "#000000", icon: "TH" },
  twitter:   { bg: "#000000", icon: "X" },
  tiktok:    { bg: "#000000", icon: "TT" },
}

export default function TaskCard({ task, index, onSelect }) {
  const [hover, setHover] = useState(false)
  const platform = task.platform || "instagram"
  const style = PLATFORM_STYLES[platform] || PLATFORM_STYLES.instagram
  const isSoldOut = task.soldOut || false

  return (
    <div
      className={"task-card fade-in" + (isSoldOut ? " sold-out" : "")}
      onClick={() => !isSoldOut && onSelect(task)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: isSoldOut ? "#ef4444" : "linear-gradient(90deg, #8b5cf6, #ec4899)",
        opacity: hover ? 1 : 0.5,
        transition: "opacity 0.3s"
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "16px",
          background: style.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", color: "white", fontWeight: 800,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          flexShrink: 0
        }}>
          {style.icon}
        </div>
        <span className={"badge " + (
          task.type === "CPE" ? "badge-cpe" :
          task.type === "CPM" ? "badge-cpm" :
          task.type === "PINNED" ? "badge-pinned" :
          "badge-cpe"
        )}>
          {task.type || "CPE"}
        </span>
      </div>

      <div style={{
        color: "#1e1b4b", fontSize: "15px", fontWeight: 700,
        marginBottom: "8px", lineHeight: 1.4, minHeight: "42px"
      }}>
        {hover && !isSoldOut && <span style={{ color: "#8b5cf6" }}>&gt; </span>}
        {task.name}
      </div>

      <div style={{
        color: "#6b7280", fontSize: "13px",
        marginBottom: "16px", lineHeight: 1.5
      }}>
        {task.description}
      </div>

      <div style={{
        display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px"
      }}>
        <span className="price-tag">{task.price}</span>
        <span className="price-unit">{task.priceUnit}</span>
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "12px", color: "#9ca3af", marginBottom: "16px"
      }}>
        <span>Slots: <span style={{ color: "#1e1b4b", fontWeight: 600 }}>{task.slots || "1/1"}</span></span>
        <span>people</span>
      </div>

      {isSoldOut ? (
        <div style={{
          width: "100%", padding: "12px", textAlign: "center",
          background: "rgba(239, 68, 68, 0.08)", color: "#ef4444",
          borderRadius: "12px", fontSize: "13px", fontWeight: 700,
          letterSpacing: "0.05em"
        }}>
          SOLD OUT
        </div>
      ) : (
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Accept Task &rarr;
        </button>
      )}
    </div>
  )
}

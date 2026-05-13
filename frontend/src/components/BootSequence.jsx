import { useState, useEffect } from "react"

const STEPS = [
  { text: "Initializing AiToEarn Protocol...", delay: 0 },
  { text: "Loading creator marketplace...", delay: 400 },
  { text: "Connecting to social platforms...", delay: 800 },
  { text: "Instagram API OK", delay: 1200 },
  { text: "YouTube API OK", delay: 1400 },
  { text: "Threads API OK", delay: 1600 },
  { text: "X/Twitter API OK", delay: 1800 },
  { text: "Syncing available tasks...", delay: 2200 },
  { text: "Ready to earn", delay: 2800 },
]

export default function BootSequence({ onDone }) {
  const [visible, setVisible] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setVisible(v => [...v, i])
        setProgress(((i + 1) / STEPS.length) * 100)
        if (i === STEPS.length - 1) setTimeout(onDone, 800)
      }, step.delay)
    })
  }, [])

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(135deg, #f0e6ff 0%, #e6f0ff 50%, #fff0f5 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
    }}>
      <div style={{ width: "100%", maxWidth: "480px", padding: "0 32px", textAlign: "center" }}>
        <div style={{
          fontSize: "32px", fontWeight: 800,
          background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", marginBottom: "8px"
        }}>
          AiToEarn
        </div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "48px", letterSpacing: "0.05em" }}>
          CREATOR MARKETPLACE
        </div>
        <div style={{
          height: "4px", background: "rgba(139, 92, 246, 0.1)",
          borderRadius: "10px", marginBottom: "32px", overflow: "hidden"
        }}>
          <div style={{
            height: "100%", width: progress + "%",
            background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
            borderRadius: "10px", transition: "width 0.4s ease"
          }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              fontSize: "13px",
              color: visible.includes(i) ? "#1e1b4b" : "#9ca3af",
              opacity: visible.includes(i) ? 1 : 0,
              transition: "all 0.3s ease",
              display: "flex", alignItems: "center", gap: "10px",
              fontFamily: "Inter, sans-serif"
            }}>
              <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 700,
                background: visible.includes(i)
                  ? (i === STEPS.length - 1 ? "linear-gradient(135deg, #10b981, #34d399)" : "linear-gradient(135deg, #8b5cf6, #ec4899)")
                  : "#e5e7eb",
                color: visible.includes(i) ? "white" : "#9ca3af",
                transition: "all 0.3s ease"
              }}>
                {visible.includes(i) ? "v" : ""}
              </span>
              {step.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import os

files = {}

# ============================================
# 1. index.css - Glassmorphism Modern Style
# ============================================
files['src/index.css'] = """@import "tailwindcss";

:root {
  --bg:         #f8f7ff;
  --bg-gradient: linear-gradient(135deg, #f0e6ff 0%, #e6f0ff 50%, #fff0f5 100%);
  --card:       rgba(255, 255, 255, 0.72);
  --card-solid: #ffffff;
  --border:     rgba(255, 255, 255, 0.5);
  --border-glass: rgba(200, 180, 255, 0.3);
  --primary:    #8b5cf6;
  --primary-light: #a78bfa;
  --primary-glow: rgba(139, 92, 246, 0.15);
  --secondary:  #ec4899;
  --secondary-light: #f472b6;
  --accent:     #f59e0b;
  --accent-light: #fbbf24;
  --success:    #10b981;
  --danger:     #ef4444;
  --text:       #1e1b4b;
  --text-secondary: #6b7280;
  --text-dim:   #9ca3af;
  --shadow:     0 8px 32px rgba(139, 92, 246, 0.12);
  --shadow-lg:  0 12px 40px rgba(139, 92, 246, 0.18);
}

* { margin:0; padding:0; box-sizing:border-box; }
body { 
  background: var(--bg); 
  background-image: var(--bg-gradient);
  background-attachment: fixed;
  color: var(--text); 
  font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif; 
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
a { text-decoration:none; color: inherit; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--primary-light); border-radius: 10px; }
::selection { background: var(--primary-light); color: white; }

.c-primary   { color: var(--primary) !important; }
.c-secondary { color: var(--secondary) !important; }
.c-accent    { color: var(--accent) !important; }
.c-success   { color: var(--success) !important; }
.c-danger    { color: var(--danger) !important; }
.c-text      { color: var(--text) !important; }
.c-text-sec  { color: var(--text-secondary) !important; }
.c-dim       { color: var(--text-dim) !important; }

.bg-main     { background: var(--bg) !important; }
.bg-card     { background: var(--card) !important; }
.bg-card-solid { background: var(--card-solid) !important; }
.bg-primary  { background: var(--primary) !important; }
.bg-secondary{ background: var(--secondary) !important; }

.glass {
  background: var(--card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow);
  border-radius: 16px;
}
.glass-strong {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: var(--shadow-lg);
  border-radius: 20px;
}

.btn {
  border: none;
  padding: 10px 20px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  background: transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 12px;
  outline: none;
}
.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.45);
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: var(--primary);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(10px);
}
.btn-secondary:hover {
  background: white;
  box-shadow: var(--shadow);
}
.btn-accent {
  background: linear-gradient(135deg, var(--accent) 0%, #f97316 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
}
.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.45);
}
.btn-ghost {
  color: var(--text-secondary);
  background: transparent;
}
.btn-ghost:hover {
  background: rgba(139, 92, 246, 0.08);
  color: var(--primary);
}

.lbl {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.badge-cpe { background: rgba(139, 92, 246, 0.12); color: var(--primary); }
.badge-cpm { background: rgba(245, 158, 11, 0.12); color: var(--accent); }
.badge-pinned { background: rgba(236, 72, 153, 0.12); color: var(--secondary); }
.badge-sold { background: rgba(239, 68, 68, 0.08); color: var(--danger); }
.badge-active { background: rgba(16, 185, 129, 0.12); color: var(--success); }

.glow-primary { text-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
.glow-accent { text-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(12px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.fade-in { animation: fadeIn 0.4s ease forwards; }
.float { animation: float 6s ease-in-out infinite; }
.pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }

.header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border-glass);
  position: sticky;
  top: 0;
  z-index: 40;
}
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-nav {
  display: flex;
  padding: 0 32px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 4px;
}
.tab {
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background: transparent;
  border-left: 0;
  border-right: 0;
  border-top: 0;
  font-family: inherit;
  color: var(--text-dim);
  transition: all 0.25s;
  border-radius: 8px 8px 0 0;
}
.tab:hover { color: var(--primary); background: rgba(139, 92, 246, 0.05); }
.tab.active { 
  border-bottom-color: var(--primary); 
  color: var(--primary);
  background: rgba(139, 92, 246, 0.08);
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
@media(max-width: 768px) { 
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } 
  .header-top, .header-nav, .main { padding: 12px 16px; }
}
@media(max-width: 1024px) { .grid-4 { grid-template-columns: 1fr 1fr; } }

.task-card {
  background: var(--card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.task-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  opacity: 0;
  transition: opacity 0.3s;
}
.task-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(139, 92, 246, 0.4);
}
.task-card:hover::before { opacity: 1; }
.task-card.sold-out {
  opacity: 0.6;
  cursor: not-allowed;
}
.task-card.sold-out:hover {
  transform: none;
  box-shadow: var(--shadow);
}

.progress-track {
  height: 8px;
  background: rgba(139, 92, 246, 0.1);
  display: flex;
  overflow: hidden;
  margin: 10px 0;
  border-radius: 10px;
}
.progress-fill {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.6s ease;
  height: 100%;
  border-radius: 10px;
}

.inp-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-glass);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.25s;
}
.inp-wrap:focus-within {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  background: white;
}
.inp-wrap input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  padding: 12px 14px;
}

footer {
  border-top: 1px solid var(--border-glass);
  padding: 20px 32px;
  font-size: 12px;
  color: var(--text-dim);
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 48px auto 0;
  backdrop-filter: blur(10px);
}
footer a { color: var(--text-dim); transition: color 0.2s; }
footer a:hover { color: var(--primary); }

.tbl-head {
  display: grid;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-glass);
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
}
.tbl-row {
  display: grid;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-glass);
  font-size: 14px;
  transition: all 0.15s;
  cursor: pointer;
  align-items: center;
}
.tbl-row:hover { background: rgba(139, 92, 246, 0.03); }
.tbl-row:last-child { border-bottom: none; }

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 32px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.06) 100%);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  position: relative;
  overflow: hidden;
}
.hero::after {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.hero-text { max-width: 500px; position: relative; z-index: 1; }
.hero-title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.price-tag {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent) 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.price-unit {
  font-size: 13px;
  color: var(--text-dim);
  font-weight: 500;
}
"""

# ============================================
# 2. BootSequence.jsx - Glassmorphism Loading
# ============================================
files['src/components/BootSequence.jsx'] = """import { useState, useEffect } from "react"

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
"""

# ============================================
# 3. Header.jsx - Glassmorphism Header
# ============================================
files['src/components/Header.jsx'] = """export default function Header({ wallet, onConnect, activeTab, setActiveTab }) {
  const tabs = ["TASKS", "AGENTS", "EARNINGS"]
  const short = wallet ? wallet.slice(0, 6) + "..." + wallet.slice(-4) : null

  return (
    <header className="header">
      <div className="header-top">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "12px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "16px", fontWeight: 800,
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
            }}>
              A
            </div>
            <div>
              <span style={{
                fontWeight: 800, fontSize: "16px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", letterSpacing: "-0.02em"
              }}>AiToEarn</span>
              <span style={{ fontSize: "10px", color: "#9ca3af", marginLeft: "8px", fontWeight: 500 }}>v2.0</span>
            </div>
          </div>
          <span className="badge badge-active" style={{ fontSize: "10px" }}> LIVE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px" }}>
          <span style={{ color: "#6b7280" }}>
            Tasks: <span style={{ color: "#8b5cf6", fontWeight: 700 }}>24</span>
          </span>
          <span style={{ color: "#6b7280" }}>
            Earned: <span style={{ color: "#f59e0b", fontWeight: 700 }}>$0.00</span>
          </span>
          {wallet ? (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(10px)",
              padding: "8px 16px", borderRadius: "12px",
              border: "1px solid rgba(139, 92, 246, 0.2)"
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#10b981", boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                display: "inline-block"
              }} />
              <span style={{ color: "#1e1b4b", fontWeight: 600, fontSize: "13px" }}>{short}</span>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="header-nav">
        {tabs.map(tab => (
          <button
            key={tab}
            className={"tab" + (activeTab === tab ? " active" : "")}
            onClick={() => setActiveTab(tab)}
          >{tab}</button>
        ))}
      </div>
    </header>
  )
}
"""

# ============================================
# 4. TaskCard.jsx - Glassmorphism Task Cards
# ============================================
files['src/components/TaskCard.jsx'] = """import { useState } from "react"

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
"""

# ============================================
# 5. TaskDetail.jsx - Glassmorphism Task Detail
# ============================================
files['src/components/TaskDetail.jsx'] = """import { useState } from "react"

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
"""

# ============================================
# 6. CreatorPanel.jsx - Glassmorphism Creator Panel
# ============================================
files['src/components/CreatorPanel.jsx'] = """export default function CreatorPanel() {
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
"""

# ============================================
# 7. Earnings.jsx - Glassmorphism Earnings
# ============================================
files['src/components/Earnings.jsx'] = """export default function Earnings({ wallet }) {
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
"""

# ============================================
# 8. App.jsx - Main App with Glassmorphism Design
# ============================================
files['src/App.jsx'] = """import { useState, useEffect } from "react"
import BootSequence from "./components/BootSequence"
import Header from "./components/Header"
import TaskCard from "./components/TaskCard"
import TaskDetail from "./components/TaskDetail"
import CreatorPanel from "./components/CreatorPanel"
import Earnings from "./components/Earnings"

const TASKS = [
  {
    address: "task-001",
    name: "Jimeng promotion task",
    description: "Pinned CPE promotion task. Settled by valid interactions: likes, comments, saves, and shares.",
    price: "$0.8",
    priceUnit: "per interaction",
    maxEarn: "$20,000",
    type: "PINNED",
    platform: "instagram",
    slots: "1/1",
    soldOut: true,
    requirements: ["Minimum 10K followers", "Public Instagram account", "High engagement rate"]
  },
  {
    address: "task-002",
    name: "AiToEarn CPE Campaign",
    description: "One-Click Post. Share AiToEarn content and earn per engagement.",
    price: "$1.00",
    priceUnit: "Per 1K Engagements",
    maxEarn: "$5,000",
    type: "CPE",
    platform: "threads",
    slots: "1/1",
    soldOut: true,
    requirements: ["Threads account active", "Minimum 5K followers", "English content preferred"]
  },
  {
    address: "task-003",
    name: "AiToEarn Threads CPE",
    description: "Engagement-based promotion on Threads platform.",
    price: "$0.10",
    priceUnit: "Per 1K Engagements",
    maxEarn: "$1,000",
    type: "CPE",
    platform: "threads",
    slots: "1/1",
    soldOut: true,
    requirements: ["Active Threads account", "Minimum 1K followers"]
  },
  {
    address: "task-004",
    name: "Promote AiToEarn",
    description: "CPM campaign. One-Click Post for maximum reach.",
    price: "$1.00",
    priceUnit: "Per 1K Views + $0.50",
    maxEarn: "$10,000",
    type: "CPM",
    platform: "instagram",
    slots: "1/1",
    soldOut: true,
    requirements: ["Minimum 50K followers", "High story views", "Brand-safe content"]
  },
  {
    address: "task-005",
    name: "AiToEarn Instagram CPM",
    description: "Reach-based promotion on Instagram feed and stories.",
    price: "$0.10",
    priceUnit: "Per 1K Views",
    maxEarn: "$2,000",
    type: "CPM",
    platform: "instagram",
    slots: "1/1",
    soldOut: true,
    requirements: ["Minimum 10K followers", "Public profile", "Consistent posting"]
  },
  {
    address: "task-006",
    name: "AiToEarn Twitter CPM",
    description: "Twitter/X reach campaign for AiToEarn brand awareness.",
    price: "$0.10",
    priceUnit: "Per 1K Views",
    maxEarn: "$2,000",
    type: "CPM",
    platform: "twitter",
    slots: "1/1",
    soldOut: true,
    requirements: ["Minimum 10K followers", "Active tweeting", "English content"]
  },
  {
    address: "task-007",
    name: "AiToEarn YouTube CPM",
    description: "Video promotion campaign on YouTube platform.",
    price: "$1.00",
    priceUnit: "Per 1K Views",
    maxEarn: "$15,000",
    type: "CPM",
    platform: "youtube",
    slots: "1/1",
    soldOut: true,
    requirements: ["Minimum 100K subscribers", "Monetization enabled", "Brand-safe channel"]
  },
  {
    address: "task-008",
    name: "New Instagram CPE Task",
    description: "Fresh engagement task for Instagram creators.",
    price: "$0.50",
    priceUnit: "per interaction",
    maxEarn: "$3,000",
    type: "CPE",
    platform: "instagram",
    slots: "5/10",
    soldOut: false,
    requirements: ["Minimum 5K followers", "Active stories", "High engagement rate"]
  },
]

export default function App() {
  const [booted, setBooted] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [activeTab, setActiveTab] = useState("TASKS")
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")

  useEffect(() => {
    if (booted) {
      setTimeout(() => {
        setWallet("0x742d35Cc6634C0532925a3b8D4C9db96590f6C7E")
      }, 2000)
    }
  }, [booted])

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or a Web3 wallet")
      return
    }
    try {
      const [acct] = await window.ethereum.request({ method: "eth_requestAccounts" })
      setWallet(acct)
    } catch (e) {
      console.error(e)
    }
  }

  const filteredTasks = TASKS.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = filterPlatform === "all" || task.platform === filterPlatform
    return matchesSearch && matchesPlatform
  })

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{
        position: "fixed", top: "10%", left: "5%",
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, borderRadius: "50%"
      }} />
      <div style={{
        position: "fixed", bottom: "10%", right: "5%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, borderRadius: "50%"
      }} />

      <Header
        wallet={wallet}
        onConnect={connectWallet}
        activeTab={activeTab}
        setActiveTab={t => { setActiveTab(t); setSelected(null) }}
      />

      <main className="main" style={{ position: "relative", zIndex: 1 }}>
        {activeTab === "TASKS" && !selected && (
          <div className="hero">
            <div className="hero-text">
              <div className="hero-title">
                Earn With Your<br />Social Media
              </div>
              <div className="hero-subtitle">
                Complete promotion tasks from top brands and get paid for every engagement.
                Join thousands of creators already earning on AiToEarn.
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "15px" }}>
                  Browse Tasks &rarr;
                </button>
                <button className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: "15px" }}>
                  How It Works
                </button>
              </div>
            </div>
            <div className="float" style={{
              width: "280px", height: "280px",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
              borderRadius: "24px",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "80px", backdropFilter: "blur(10px)",
              boxShadow: "0 20px 60px rgba(139, 92, 246, 0.15)"
            }}>
              &lt;&gt;
            </div>
          </div>
        )}

        {activeTab === "TASKS" && !selected && (
          <div style={{
            display: "flex", gap: "12px", marginBottom: "24px",
            alignItems: "center", flexWrap: "wrap"
          }}>
            <div className="inp-wrap" style={{ flex: 1, minWidth: "250px" }}>
              <span style={{ padding: "0 12px", fontSize: "18px" }}>S</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ fontSize: "14px" }}
              />
            </div>
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              style={{
                padding: "12px 16px", borderRadius: "12px",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                background: "rgba(255,255,255,0.7)",
                color: "#1e1b4b", fontSize: "14px", fontFamily: "inherit",
                backdropFilter: "blur(10px)", cursor: "pointer", outline: "none"
              }}
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="threads">Threads</option>
              <option value="twitter">X/Twitter</option>
              <option value="tiktok">TikTok</option>
            </select>
            <div className="glass" style={{
              padding: "10px 16px", fontSize: "13px", color: "#6b7280",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span style={{ color: "#8b5cf6", fontWeight: 700 }}>{filteredTasks.length}</span> tasks found
            </div>
          </div>
        )}

        {activeTab === "TASKS" && !selected && (
          <div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "20px"
            }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                <span style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>Available Tasks</span>
                <span style={{ color: "#9ca3af", fontWeight: 500, marginLeft: "8px" }}>
                  ({filteredTasks.length})
                </span>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: "13px" }}>
                + Create Campaign
              </button>
            </div>
            <div className="grid-4">
              {filteredTasks.map((task, i) => (
                <TaskCard key={task.address} task={task} index={i} onSelect={setSelected} />
              ))}
            </div>
            {filteredTasks.length === 0 && (
              <div className="glass" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>?</div>
                <div style={{ color: "#6b7280", fontSize: "16px", fontWeight: 600 }}>
                  No tasks found
                </div>
                <div style={{ color: "#9ca3af", fontSize: "14px", marginTop: "8px" }}>
                  Try adjusting your search or filters
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "TASKS" && selected &&
          <TaskDetail task={selected} wallet={wallet} onBack={() => setSelected(null)} />}
        {activeTab === "AGENTS" && <CreatorPanel />}
        {activeTab === "EARNINGS" && <Earnings wallet={wallet} />}
      </main>

      <footer>
        <span>AiToEarn &copy; 2026 — Creator Marketplace Platform</span>
        <span>
          <a href="#" style={{ color: "#6b7280" }}>Terms</a>
          {" · "}
          <a href="#" style={{ color: "#6b7280" }}>Privacy</a>
          {" · "}
          <a href="#" style={{ color: "#6b7280" }}>Support</a>
        </span>
      </footer>
    </div>
  )
}
"""

# ============================================
# Write all files
# ============================================
for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"v {path}  ({len(content)} chars)")

print("\n" + "="*50)
print("ALL FILES WRITTEN SUCCESSFULLY!")
print("="*50)
print("\nFile structure:")
print("   src/index.css                    -> Glassmorphism styles")
print("   src/components/BootSequence.jsx  -> Modern loading screen")
print("   src/components/Header.jsx        -> Glassmorphism header")
print("   src/components/TaskCard.jsx      -> Glassmorphism task cards")
print("   src/components/TaskDetail.jsx    -> Glassmorphism task detail")
print("   src/components/CreatorPanel.jsx  -> Glassmorphism creator panel")
print("   src/components/Earnings.jsx      -> Glassmorphism earnings")
print("   src/App.jsx                      -> Main app with glassmorphism design")
print("\nDesign changes from cyberpunk -> glassmorphism:")
print("   - Background:  #0a0a0a -> gradient purple/pink/white")
print("   - Cards:      Terminal boxes -> glass blur + transparency")
print("   - Colors:     Green/red terminal -> Purple/pink/orange gradients")
print("   - Typography: JetBrains Mono -> Inter/SF Pro (sans-serif)")
print("   - Buttons:    Border glow -> Gradient fills + hover lift")
print("   - Shadows:    None -> Soft purple glow shadows")
print("   - Effects:    Scanlines -> Floating orbs + blur")
print("\nRun: npm run dev -- --host")

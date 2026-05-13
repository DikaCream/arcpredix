import { useState, useEffect } from "react"

export default function CountdownTimer({ resolutionTime, resolved }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    if (!resolutionTime || resolved) return

    const calc = () => {
      const diff = resolutionTime - Math.floor(Date.now()/1000)
      if (diff <= 0) { setTimeLeft("Resolving..."); return }

      const d = Math.floor(diff / 86400)
      const h = Math.floor((diff % 86400) / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60

      if (d > 0)      setTimeLeft(`${d}d ${h}h`)
      else if (h > 0) setTimeLeft(`${h}h ${m}m`)
      else if (m > 0) setTimeLeft(`${m}m ${s}s`)
      else            setTimeLeft(`${s}s`)
    }

    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [resolutionTime, resolved])

  if (!resolutionTime) return null
  if (resolved)        return <span style={{ color:"#94A3B8", fontSize:10 }}>Resolved</span>

  return (
    <span style={{
      fontSize:10, fontWeight:600,
      color: timeLeft.includes("d") ? "#F59E0B" : "#EF4444",
      background: timeLeft.includes("d") ? "#FEF3C7" : "#FEE2E2",
      padding:"2px 8px", borderRadius:99
    }}>
      ⏱ {timeLeft}
    </span>
  )
}

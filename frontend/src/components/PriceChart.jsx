import { useMemo } from "react"

function generateHistory(currentPrice, points = 48) {
  const data = []
  let price = 0.5
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * 0.04
    price = Math.max(0.05, Math.min(0.95, price))
    data.push({
      price,
      time: Date.now() - (points - i) * 30 * 60 * 1000,
      volume: Math.random() * 5000 + 500,
    })
  }
  // nudge last point toward current
  data[data.length - 1].price = currentPrice
  return data
}

export default function PriceChart({ market }) {
  const history = useMemo(() => generateHistory(market.priceYes ?? 0.5), [market.address])

  const W = 600, H = 160, PAD = { top:16, right:16, bottom:24, left:40 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top  - PAD.bottom

  const prices  = history.map(d => d.price)
  const minP    = Math.max(0, Math.min(...prices) - 0.05)
  const maxP    = Math.min(1, Math.max(...prices) + 0.05)
  const range   = maxP - minP || 0.1

  const xScale = i => PAD.left + (i / (history.length - 1)) * chartW
  const yScale = p => PAD.top  + chartH - ((p - minP) / range) * chartH

  // Smooth SVG line using bezier
  const linePath = history.map((d, i) => {
    const x = xScale(i), y = yScale(d.price)
    if (i === 0) return `M${x},${y}`
    const px = xScale(i - 1), py = yScale(history[i - 1].price)
    const cx = (px + x) / 2
    return `C${cx},${py} ${cx},${y} ${x},${y}`
  }).join(" ")

  const areaPath = linePath +
    ` L${xScale(history.length-1)},${PAD.top+chartH}` +
    ` L${xScale(0)},${PAD.top+chartH} Z`

  const lastPrice  = history[history.length - 1].price
  const firstPrice = history[0].price
  const change     = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(1)
  const isUp       = lastPrice >= firstPrice
  const color      = isUp ? "#10B981" : "#EF4444"

  const yTicks = [0.25, 0.5, 0.75].map(t => minP + t * range)

  const fmtTime = ts => {
    const d = new Date(ts)
    return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0")
  }

  const xTickIdxs = [0, Math.floor(history.length/4), Math.floor(history.length/2), Math.floor(3*history.length/4), history.length-1]

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", padding:"16px 0 8px", marginBottom:12 }}>
      {/* Chart header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 16px 12px" }}>
        <div>
          <span style={{ fontSize:11, color:"#94A3B8", fontWeight:500 }}>YES PROBABILITY · 24H</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20, fontWeight:800, color:color }}>
            {Math.round(lastPrice*100)}%
          </span>
          <span style={{
            fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:8,
            background: isUp ? "#D1FAE5" : "#FEE2E2",
            color: isUp ? "#059669" : "#DC2626"
          }}>
            {isUp?"+":""}{change}%
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ display:"block", overflow:"visible" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={isUp?"#06B6D4":"#F97316"}/>
            <stop offset="100%" stopColor={color}/>
          </linearGradient>
        </defs>

        {/* Y grid lines */}
        {yTicks.map((t,i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yScale(t)} x2={W-PAD.right} y2={yScale(t)}
              stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"/>
            <text x={PAD.left-6} y={yScale(t)+4} textAnchor="end"
              fontSize="9" fill="#94A3B8" fontFamily="Inter,sans-serif">
              {Math.round(t*100)}%
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)"/>

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"/>

        {/* Last point dot */}
        <circle cx={xScale(history.length-1)} cy={yScale(lastPrice)} r="4"
          fill={color} stroke="#fff" strokeWidth="2"/>

        {/* X axis labels */}
        {xTickIdxs.map((idx,i) => (
          <text key={i} x={xScale(idx)} y={H-4} textAnchor="middle"
            fontSize="8" fill="#94A3B8" fontFamily="Inter,sans-serif">
            {fmtTime(history[idx].time)}
          </text>
        ))}
      </svg>

      {/* Volume bars */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:1, padding:"4px 40px 0 40px", height:24 }}>
        {history.map((d,i) => (
          <div key={i} style={{
            flex:1, borderRadius:1,
            height: Math.max(2, (d.volume/6000)*24)+"px",
            background: d.price >= (i>0?history[i-1].price:d.price) ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
            transition:"height 0.3s"
          }}/>
        ))}
      </div>
      <div style={{ fontSize:10, color:"#94A3B8", textAlign:"right", padding:"2px 16px 0" }}>Volume</div>
    </div>
  )
}

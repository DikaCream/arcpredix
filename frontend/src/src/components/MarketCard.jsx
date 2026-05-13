import { useState } from "react"
import CountdownTimer from "./CountdownTimer"

export default function MarketCard({ market, index, onSelect, liveData }) {
  const [hov, setHov] = useState(false)

  const data    = liveData || {}
  const pctYes  = Math.round((data.priceYes ?? market.priceYes ?? 0.5) * 100)
  const pctNo   = 100 - pctYes
  const resolved= data.resolved ?? market.resolved ?? false
  const vol     = data.totalVolume
    ? Number(Number(data.totalVolume).toFixed(0)).toLocaleString()
    : "0"

  const cats   = ["Crypto","Finance","Technology","Macro","Circle","Crypto"]
  const colors = [
    ["#EEF2FF","#4F46E5"],["#F0FDF4","#16A34A"],["#FFF7ED","#EA580C"],
    ["#FDF4FF","#9333EA"],["#E0F2FE","#0369A1"],["#EEF2FF","#4F46E5"],
  ]
  const [bg, fg] = colors[index % colors.length]

  return (
    <div className="card card-hover fade-up" style={{ padding:"18px", cursor:"pointer" }}
      onClick={()=>onSelect(market)}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <span style={{ background:bg, color:fg, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:600 }}>
          {cats[index % cats.length]}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {liveData?.resolutionTime && (
            <CountdownTimer resolutionTime={liveData.resolutionTime} resolved={resolved} />
          )}
          <span className={"badge "+(resolved?"badge-sold":"badge-active")}>
            {resolved ? "Resolved" : "● Live"}
          </span>
        </div>
      </div>

      <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", lineHeight:1.5, marginBottom:14, minHeight:42 }}>
        {hov && <span style={{ color:"var(--primary)" }}>{">"} </span>}
        {market.question}
      </div>

      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", display:"inline-block" }}/>
            <span style={{ fontSize:13, fontWeight:700, color:"#059669" }}>YES {pctYes}%</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#991B1B" }}>NO {pctNo}%</span>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444", display:"inline-block" }}/>
          </div>
        </div>
        <div className="progress-wrap" style={{ position:"relative", height:8 }}>
          <div style={{ position:"absolute", left:0, height:"100%", width:pctYes+"%",
            background:"linear-gradient(90deg,#10B981,#06B6D4)", borderRadius:99, transition:"width 0.6s" }}/>
          <div style={{ position:"absolute", right:0, height:"100%", width:pctNo+"%",
            background:"linear-gradient(90deg,#EF4444,#F97316)", borderRadius:99, transition:"width 0.6s" }}/>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:12, color:"var(--muted)" }}>
          Vol: <span style={{ fontWeight:600, color:"var(--text)" }}>${vol} USDC</span>
        </div>
        <button className="btn-outline btn-sm" style={{ fontSize:11 }}>Trade →</button>
      </div>
    </div>
  )
}

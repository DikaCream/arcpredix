import os

files = {}

files['src/components/PriceChart.jsx'] = '''import { useMemo } from "react"

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
'''

files['src/components/OrderBook.jsx'] = '''import { useMemo, useState } from "react"

function generateOrders(midPrice, side, count=8) {
  const orders = []
  let price = midPrice
  for (let i = 0; i < count; i++) {
    price = side === "bid"
      ? price - (Math.random() * 0.02 + 0.005)
      : price + (Math.random() * 0.02 + 0.005)
    price = Math.max(0.01, Math.min(0.99, price))
    const size = Math.round(Math.random() * 4000 + 200)
    orders.push({ price, size, total: 0 })
  }
  // calc cumulative total
  let cum = 0
  orders.forEach(o => { cum += o.size; o.total = cum })
  return orders
}

function generateTrades(midPrice, count=10) {
  const trades = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.5
    const price = midPrice + (Math.random() - 0.5) * 0.06
    trades.push({
      side:   isBuy ? "YES" : "NO",
      price:  Math.max(0.01, Math.min(0.99, price)),
      size:   Math.round(Math.random() * 500 + 50),
      time:   now - i * (Math.random() * 60000 + 10000),
    })
  }
  return trades
}

export default function OrderBook({ market }) {
  const [view, setView] = useState("book")
  const mid = market.priceYes ?? 0.5

  const asks   = useMemo(() => generateOrders(mid, "ask", 8), [market.address])
  const bids   = useMemo(() => generateOrders(mid, "bid", 8), [market.address])
  const trades = useMemo(() => generateTrades(mid, 12), [market.address])

  const maxTotal = Math.max(...bids.map(b=>b.total), ...asks.map(a=>a.total))
  const spread   = asks[0] && bids[0] ? Math.abs(asks[0].price - bids[0].price) : 0

  const fmtTime = ts => {
    const d   = new Date(ts)
    const sec = Math.round((Date.now()-ts)/1000)
    if (sec < 60)  return sec+"s ago"
    if (sec < 3600) return Math.round(sec/60)+"m ago"
    return d.getHours()+":"+d.getMinutes().toString().padStart(2,"0")
  }

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", marginBottom:12, overflow:"hidden" }}>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid #E2E8F0" }}>
        {[
          { id:"book",   label:"Order Book" },
          { id:"trades", label:"Recent Trades" },
        ].map(t => (
          <button key={t.id} onClick={()=>setView(t.id)} style={{
            flex:1, padding:"12px 0", fontSize:12, fontWeight:600, border:"none",
            background: view===t.id ? "#F8FAFC" : "#fff",
            color: view===t.id ? "#4F46E5" : "#94A3B8",
            borderBottom: view===t.id ? "2px solid #4F46E5" : "2px solid transparent",
            cursor:"pointer", transition:"all 0.15s"
          }}>{t.label}</button>
        ))}
      </div>

      {view === "book" && (
        <div>
          {/* Column headers */}
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            padding:"8px 16px", fontSize:10, fontWeight:600,
            color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase",
            borderBottom:"1px solid #F1F5F9"
          }}>
            <span>Price (YES%)</span>
            <span style={{textAlign:"right"}}>Size (USDC)</span>
            <span style={{textAlign:"right"}}>Total</span>
          </div>

          {/* Asks (NO side) — reversed */}
          <div>
            {[...asks].reverse().map((a,i) => (
              <div key={i} style={{ position:"relative", display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                padding:"5px 16px", fontSize:12 }}>
                <div style={{
                  position:"absolute", right:0, top:0, bottom:0,
                  width: (a.total/maxTotal*100)+"%",
                  background:"rgba(239,68,68,0.07)", borderLeft:"none"
                }}/>
                <span style={{ color:"#EF4444", fontWeight:600, fontVariantNumeric:"tabular-nums" }}>
                  {Math.round(a.price*100)}%
                </span>
                <span style={{ textAlign:"right", color:"#374151", fontVariantNumeric:"tabular-nums" }}>
                  {a.size.toLocaleString()}
                </span>
                <span style={{ textAlign:"right", color:"#94A3B8", fontSize:11, fontVariantNumeric:"tabular-nums" }}>
                  {a.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Spread */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"8px 16px", background:"#F8FAFC",
            borderTop:"1px solid #F1F5F9", borderBottom:"1px solid #F1F5F9"
          }}>
            <span style={{ fontSize:11, color:"#64748B" }}>
              Spread: <b style={{color:"#1E293B"}}>{(spread*100).toFixed(2)}%</b>
            </span>
            <span style={{ fontSize:13, fontWeight:800, color: mid >= 0.5 ? "#059669" : "#DC2626" }}>
              {Math.round(mid*100)}% YES
            </span>
            <span style={{ fontSize:11, color:"#64748B" }}>
              Mid price
            </span>
          </div>

          {/* Bids (YES side) */}
          <div>
            {bids.map((b,i) => (
              <div key={i} style={{ position:"relative", display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                padding:"5px 16px", fontSize:12 }}>
                <div style={{
                  position:"absolute", right:0, top:0, bottom:0,
                  width: (b.total/maxTotal*100)+"%",
                  background:"rgba(16,185,129,0.07)"
                }}/>
                <span style={{ color:"#059669", fontWeight:600, fontVariantNumeric:"tabular-nums" }}>
                  {Math.round(b.price*100)}%
                </span>
                <span style={{ textAlign:"right", color:"#374151", fontVariantNumeric:"tabular-nums" }}>
                  {b.size.toLocaleString()}
                </span>
                <span style={{ textAlign:"right", color:"#94A3B8", fontSize:11, fontVariantNumeric:"tabular-nums" }}>
                  {b.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "trades" && (
        <div>
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
            padding:"8px 16px", fontSize:10, fontWeight:600,
            color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase",
            borderBottom:"1px solid #F1F5F9"
          }}>
            <span>Side</span>
            <span style={{textAlign:"right"}}>Price</span>
            <span style={{textAlign:"right"}}>Size</span>
            <span style={{textAlign:"right"}}>Time</span>
          </div>
          {trades.map((t,i) => (
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
              padding:"7px 16px", fontSize:12,
              borderBottom: i<trades.length-1 ? "1px solid #F8FAFC" : "none",
              background: i%2===0 ? "#fff" : "#FAFBFF"
            }}>
              <span style={{
                color: t.side==="YES" ? "#059669" : "#DC2626",
                fontWeight:700, fontSize:11
              }}>{t.side}</span>
              <span style={{ textAlign:"right", color:"#374151", fontVariantNumeric:"tabular-nums" }}>
                {Math.round(t.price*100)}%
              </span>
              <span style={{ textAlign:"right", color:"#374151", fontVariantNumeric:"tabular-nums" }}>
                ${t.size}
              </span>
              <span style={{ textAlign:"right", color:"#94A3B8", fontSize:11 }}>
                {fmtTime(t.time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'''

files['src/components/MarketDetail.jsx'] = '''import { useState } from "react"
import PriceChart from "./PriceChart"
import OrderBook  from "./OrderBook"

export default function MarketDetail({ market, wallet, onBack }) {
  const [side,   setSide]   = useState("YES")
  const [amount, setAmount] = useState("")
  const [toast,  setToast]  = useState(null)
  const [tab,    setTab]    = useState("chart") // chart | orderbook | trade

  const pctYes = Math.round((market.priceYes??0.5)*100)
  const pctNo  = 100 - pctYes
  const vol    = market.totalVolume
    ? Number((Number(market.totalVolume)/1e18).toFixed(0)).toLocaleString()
    : "0"

  const showToast = (msg, type="success") => {
    setToast({msg, type})
    setTimeout(() => setToast(null), 3000)
  }

  const execute = () => {
    if (!wallet) { showToast("Connect wallet first", "error"); return }
    if (!amount) { showToast("Enter an amount", "error"); return }
    showToast("Submitting to Arc Testnet...", "success")
    setTimeout(() => showToast("✓ Confirmed on Arc! Sub-second finality.", "success"), 2200)
  }

  const estShares = amount
    ? (Number(amount) / (side==="YES" ? (market.priceYes??0.5) : (1-(market.priceYes??0.5)))).toFixed(2)
    : null

  return (
    <div style={{ paddingBottom:80 }}>
      {toast && (
        <div className={"toast "+(toast.type==="error"?"error":"success")}>{toast.msg}</div>
      )}

      {/* Back */}
      <button onClick={onBack} style={{
        display:"flex", alignItems:"center", gap:6, color:"#64748B",
        fontSize:13, fontWeight:500, background:"none", border:"none",
        marginBottom:14, padding:0, cursor:"pointer"
      }}>← Back</button>

      {/* Market header */}
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <span className="badge badge-active">● Live</span>
          <span style={{ fontSize:11, color:"#94A3B8" }}>Arc Testnet · USDC</span>
        </div>
        <div style={{ fontSize:15, fontWeight:700, color:"#1E293B", lineHeight:1.5, marginBottom:14 }}>
          {market.question}
        </div>

        {/* Prices */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div style={{ background:"#F0FDF4", borderRadius:12, padding:"12px 14px", border:"1px solid #BBF7D0" }}>
            <div style={{ fontSize:10, color:"#6B7280", fontWeight:500, marginBottom:2 }}>YES</div>
            <div style={{ fontSize:26, fontWeight:800, color:"#059669" }}>{pctYes}¢</div>
            <div style={{ fontSize:10, color:"#6B7280" }}>per share</div>
          </div>
          <div style={{ background:"#FFF1F2", borderRadius:12, padding:"12px 14px", border:"1px solid #FECDD3" }}>
            <div style={{ fontSize:10, color:"#6B7280", fontWeight:500, marginBottom:2 }}>NO</div>
            <div style={{ fontSize:26, fontWeight:800, color:"#DC2626" }}>{pctNo}¢</div>
            <div style={{ fontSize:10, color:"#6B7280" }}>per share</div>
          </div>
        </div>

        <div className="progress-wrap" style={{ height:8, marginBottom:12, position:"relative" }}>
          <div style={{ position:"absolute", left:0, height:"100%", width:pctYes+"%",
            background:"linear-gradient(90deg,#10B981,#06B6D4)", borderRadius:99, transition:"width 0.6s" }}/>
          <div style={{ position:"absolute", right:0, height:"100%", width:pctNo+"%",
            background:"linear-gradient(90deg,#EF4444,#F97316)", borderRadius:99, transition:"width 0.6s" }}/>
        </div>

        <div style={{ display:"flex", gap:16, fontSize:11, color:"#64748B" }}>
          <span>Vol: <b style={{color:"#1E293B"}}>${vol}</b></span>
          <span>Liquidity: <b style={{color:"#1E293B"}}>~$28,400</b></span>
          <span>Traders: <b style={{color:"#1E293B"}}>142</b></span>
        </div>
      </div>

      {/* Tabs: Chart / Orderbook / Trade */}
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {[
          { id:"chart",      label:"📈 Chart"      },
          { id:"orderbook",  label:"📊 Order Book" },
          { id:"trade",      label:"⚡ Trade"      },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:"9px 4px", fontSize:12, fontWeight:600, borderRadius:12,
            border: tab===t.id ? "none" : "1.5px solid #E2E8F0",
            background: tab===t.id ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "#fff",
            color: tab===t.id ? "#fff" : "#64748B",
            cursor:"pointer", transition:"all 0.15s",
            boxShadow: tab===t.id ? "0 4px 12px rgba(79,70,229,0.3)" : "none"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Chart tab */}
      {tab === "chart" && <PriceChart market={market} />}

      {/* Orderbook tab */}
      {tab === "orderbook" && <OrderBook market={market} />}

      {/* Trade tab */}
      {tab === "trade" && (
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Place Order</div>

          {/* Side selector */}
          <div className="tab-bar" style={{ marginBottom:16 }}>
            <button className={"tab-item"+(side==="YES"?" active":"")}
              onClick={()=>setSide("YES")}
              style={side==="YES"?{background:"linear-gradient(135deg,#10B981,#06B6D4)"}:{}}>
              Buy YES
            </button>
            <button className={"tab-item"+(side==="NO"?" active":"")}
              onClick={()=>setSide("NO")}
              style={side==="NO"?{background:"linear-gradient(135deg,#EF4444,#F97316)"}:{}}>
              Buy NO
            </button>
          </div>

          {/* Current price indicator */}
          <div style={{
            background: side==="YES" ? "#F0FDF4" : "#FFF1F2",
            borderRadius:12, padding:"10px 14px", marginBottom:14,
            display:"flex", justifyContent:"space-between", alignItems:"center"
          }}>
            <span style={{ fontSize:12, color:"#64748B" }}>Current {side} price</span>
            <span style={{
              fontSize:18, fontWeight:800,
              color: side==="YES" ? "#059669" : "#DC2626"
            }}>
              {side==="YES" ? pctYes : pctNo}¢
            </span>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:6 }}>
              Amount (USDC)
            </label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field has-prefix" />
            </div>
          </div>

          {/* Quick amounts */}
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["10","50","100","500"].map(v => (
              <button key={v} className="quick-btn" onClick={()=>setAmount(v)}>${v}</button>
            ))}
          </div>

          {/* Order summary */}
          {amount && Number(amount) > 0 && (
            <div style={{
              background:"#F8FAFC", borderRadius:12, padding:"14px 16px",
              marginBottom:16, border:"1px solid #E2E8F0"
            }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#1E293B", marginBottom:10 }}>
                Order Summary
              </div>
              {[
                { label:"You pay",           value:"$"+Number(amount).toFixed(2)+" USDC",        color:"#1E293B" },
                { label:"Shares received",   value:"~"+estShares+" "+side+" shares",             color: side==="YES"?"#059669":"#DC2626" },
                { label:"Price per share",   value:(side==="YES"?pctYes:pctNo)+"¢",              color:"#1E293B" },
                { label:"Potential payout",  value:"$"+(Number(estShares||0)*1).toFixed(2)+" USDC",color:"#4F46E5" },
                { label:"Protocol fee",      value:"$"+(Number(amount)*0.005).toFixed(2)+" (0.5%)",color:"#94A3B8" },
              ].map((r,i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between",
                  marginBottom: i<4 ? 6 : 0,
                  paddingBottom: i===3 ? 8 : 0,
                  borderBottom: i===3 ? "1px solid #E2E8F0" : "none"
                }}>
                  <span style={{ fontSize:12, color:"#64748B" }}>{r.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className={side==="YES" ? "btn-success" : "btn-danger"}
            onClick={execute}>
            {side==="YES" ? "Buy YES →" : "Buy NO →"}
          </button>

          <div style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:10 }}>
            Instant settlement · Arc Testnet · USDC
          </div>
        </div>
      )}
    </div>
  )
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"✓ {path}")

print("\nDone! Refresh browser.")

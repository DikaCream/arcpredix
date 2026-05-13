import { useMemo, useState } from "react"

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
    <div style={{ background:"var(--surface)", borderRadius:16, border:"1px solid var(--border)", marginBottom:12, overflow:"hidden" }}>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--border)" }}>
        {[
          { id:"book",   label:"Order Book" },
          { id:"trades", label:"Recent Trades" },
        ].map(t => (
          <button key={t.id} onClick={()=>setView(t.id)} style={{
            flex:1, padding:"12px 0", fontSize:12, fontWeight:600, border:"none",
            background: view===t.id ? "var(--light)" : "var(--surface)",
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
            color:"var(--muted)", letterSpacing:"0.06em", textTransform:"uppercase",
            borderBottom:"1px solid var(--border)"
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
                <span style={{ textAlign:"right", color:"var(--text)", fontVariantNumeric:"tabular-nums" }}>
                  {a.size.toLocaleString()}
                </span>
                <span style={{ textAlign:"right", color:"var(--muted)", fontSize:11, fontVariantNumeric:"tabular-nums" }}>
                  {a.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Spread */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"8px 16px", background:"var(--light)",
            borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)"
          }}>
            <span style={{ fontSize:11, color:"var(--muted)" }}>
              Spread: <b style={{color:"var(--text)"}}>{(spread*100).toFixed(2)}%</b>
            </span>
            <span style={{ fontSize:13, fontWeight:800, color: mid >= 0.5 ? "#059669" : "#DC2626" }}>
              {Math.round(mid*100)}% YES
            </span>
            <span style={{ fontSize:11, color:"var(--muted)" }}>
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
                <span style={{ textAlign:"right", color:"var(--text)", fontVariantNumeric:"tabular-nums" }}>
                  {b.size.toLocaleString()}
                </span>
                <span style={{ textAlign:"right", color:"var(--muted)", fontSize:11, fontVariantNumeric:"tabular-nums" }}>
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
            color:"var(--muted)", letterSpacing:"0.06em", textTransform:"uppercase",
            borderBottom:"1px solid var(--border)"
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
              borderBottom: i<trades.length-1 ? "1px solid var(--light)" : "none",
              background: "var(--surface)"
            }}>
              <span style={{
                color: t.side==="YES" ? "#059669" : "#DC2626",
                fontWeight:700, fontSize:11
              }}>{t.side}</span>
              <span style={{ textAlign:"right", color:"var(--text)", fontVariantNumeric:"tabular-nums" }}>
                {Math.round(t.price*100)}%
              </span>
              <span style={{ textAlign:"right", color:"var(--text)", fontVariantNumeric:"tabular-nums" }}>
                ${t.size}
              </span>
              <span style={{ textAlign:"right", color:"var(--muted)", fontSize:11 }}>
                {fmtTime(t.time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

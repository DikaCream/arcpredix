import { useState, useEffect } from "react"
import PriceChart            from "./PriceChart"
import OrderBook             from "./OrderBook"
import OraclePanel           from "./OraclePanel"
import CountdownTimer        from "./CountdownTimer"
import { useMarketTrade }    from "../hooks/useMarketTrade"
import { useTransactionHistory } from "../hooks/useTransactionHistory"

export default function MarketDetail({ market, wallet, onBack, liveData }) {
  const [side,   setSide]   = useState("YES")
  const [amount, setAmount] = useState("")
  const [tab,    setTab]    = useState("chart")
  const [copied, setCopied] = useState(false)

  const data = liveData || {}
  const priceYes  = data.priceYes ?? market.priceYes ?? 0.5
  const pctYes    = Math.round(priceYes * 100)
  const pctNo     = 100 - pctYes
  const resolved  = data.resolved ?? false
  const isOracle  = wallet && data.oracle && wallet.toLowerCase() === data.oracle.toLowerCase()
  const vol       = data.totalVolume ? Number(Number(data.totalVolume).toFixed(0)).toLocaleString() : "0"

  const { buy, claim, fetchPosition, fetchBalance, fetchPreview,
    txStatus, txHash, loading, position, usdcBal, preview, isReal
  } = useMarketTrade(wallet, market.address)

  const { history, loading:histLoading, fetchHistory } = useTransactionHistory(wallet, market.address)

  useEffect(() => { fetchPosition(); fetchBalance() }, [wallet, market.address])
  useEffect(() => { if (tab === "history") fetchHistory() }, [tab])
  useEffect(() => {
    const t = setTimeout(() => fetchPreview(side, amount), 300)
    return () => clearTimeout(t)
  }, [side, amount])

  // Share market
  const shareMarket = () => {
    const url = `${window.location.origin}?market=${market.address}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isSuccess = txStatus?.startsWith("✓")
  const isError   = txStatus?.startsWith("ERR")

  const OUTCOME_LABELS = ["", "YES ✓", "NO ✗", "INVALID"]

  return (
    <div style={{ paddingBottom:80 }}>
      {/* Back + Share */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, color:"var(--muted)",
          fontSize:13, fontWeight:500, background:"none", border:"none", padding:0, cursor:"pointer" }}>
          ← Back
        </button>
        <button onClick={shareMarket} style={{
          display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500,
          color:"var(--primary)", background:"var(--light)", border:"1px solid var(--border)",
          borderRadius:8, padding:"6px 12px", cursor:"pointer"
        }}>
          {copied ? "✓ Copied!" : "Share 🔗"}
        </button>
      </div>

      {/* Oracle panel */}
      {isOracle && !resolved && (
        <OraclePanel marketAddress={market.address} wallet={wallet} />
      )}

      {/* Resolved banner */}
      {resolved && (
        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12,
          padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🏁</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#059669" }}>
              Market Resolved: {OUTCOME_LABELS[data.outcome] || ""}
            </div>
            <div style={{ fontSize:11, color:"#6B7280" }}>Winners can claim their USDC payout below</div>
          </div>
        </div>
      )}

      {/* Market header */}
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span className="badge badge-active">● Live</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {data.resolutionTime && <CountdownTimer resolutionTime={data.resolutionTime} resolved={resolved} />}
            <span style={{ fontSize:11, color:isReal?"var(--primary)":"var(--muted)" }}>
              {isReal ? "✓ On-Chain" : "Demo"}
            </span>
          </div>
        </div>

        <div style={{ fontSize:15, fontWeight:700, color:"var(--text)", lineHeight:1.5, marginBottom:14 }}>
          {market.question}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div style={{ background:"#F0FDF4", borderRadius:12, padding:"12px 14px", border:"1px solid #BBF7D0" }}>
            <div style={{ fontSize:10, color:"#6B7280", marginBottom:2 }}>YES</div>
            <div style={{ fontSize:26, fontWeight:800, color:"#059669" }}>{pctYes}¢</div>
            <div style={{ fontSize:10, color:"#6B7280" }}>per share</div>
          </div>
          <div style={{ background:"#FFF1F2", borderRadius:12, padding:"12px 14px", border:"1px solid #FECDD3" }}>
            <div style={{ fontSize:10, color:"#6B7280", marginBottom:2 }}>NO</div>
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

        <div style={{ display:"flex", gap:16, fontSize:11, color:"var(--muted)" }}>
          <span>Vol: <b style={{color:"var(--text)"}}>${vol}</b></span>
          <span>Traders: <b style={{color:"var(--text)"}}>142</b></span>
        </div>
      </div>

      {/* Position card */}
      {position && (Number(position.yesShares)>0 || Number(position.noShares)>0) && (
        <div className="card" style={{ padding:14, marginBottom:12, border:"1.5px solid #C7D2FE" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"var(--primary)", marginBottom:8 }}>My Position</div>
          <div style={{ display:"flex", gap:16, fontSize:12, flexWrap:"wrap" }}>
            {Number(position.yesShares)>0 &&
              <span style={{color:"var(--text)"}}>YES: <b style={{color:"#059669"}}>{Number(position.yesShares).toFixed(4)}</b></span>}
            {Number(position.noShares)>0 &&
              <span style={{color:"var(--text)"}}>NO: <b style={{color:"#DC2626"}}>{Number(position.noShares).toFixed(4)}</b></span>}
            <span style={{color:"var(--muted)"}}>Deposited: <b style={{color:"var(--text)"}}>${Number(position.totalDeposited).toFixed(2)}</b></span>
          </div>
          {resolved && (
            <button className="btn-primary btn-sm" style={{marginTop:10}} onClick={claim}>
              Claim Payout →
            </button>
          )}
        </div>
      )}

      {/* Tabs: chart / orderbook / trade / history */}
      <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto" }}>
        {[
          {id:"chart",     label:"📈"},
          {id:"orderbook", label:"📊"},
          {id:"trade",     label:"⚡ Trade"},
          {id:"history",   label:"📋 History"},
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"8px 12px", fontSize:12, fontWeight:600, borderRadius:12, whiteSpace:"nowrap",
            border: tab===t.id ? "none" : "1.5px solid var(--border)",
            background: tab===t.id ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "var(--surface)",
            color: tab===t.id ? "#fff" : "var(--muted)",
            cursor:"pointer", transition:"all 0.15s",
            boxShadow: tab===t.id ? "0 4px 12px rgba(79,70,229,0.3)" : "none",
            flexShrink:0,
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="chart"     && <PriceChart market={{...market, priceYes}} />}
      {tab==="orderbook" && <OrderBook  market={{...market, priceYes}} />}

      {/* Transaction History */}
      {tab === "history" && (
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>My Trades</div>
            {histLoading && <span style={{ fontSize:11, color:"var(--muted)" }}>Loading...</span>}
          </div>
          {!wallet ? (
            <div style={{ padding:"24px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
              Connect wallet to see your trade history
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding:"32px 0", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
              <div style={{ fontSize:13, color:"var(--muted)" }}>No trades on this market yet</div>
            </div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
                padding:"8px 16px", fontSize:10, fontWeight:600, color:"var(--muted)",
                textTransform:"uppercase", letterSpacing:"0.06em",
                borderBottom:"1px solid var(--border)", background:"var(--light)" }}>
                <span>Side</span><span>Amount</span><span>Shares</span><span>Price</span>
              </div>
              {history.map((tx,i) => (
                <a key={i} href={`https://testnet.arcscan.app/tx/${tx.txHash}`}
                  target="_blank" rel="noreferrer"
                  style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
                    padding:"10px 16px", fontSize:12, borderBottom:"1px solid var(--border)",
                    textDecoration:"none", transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--light)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{ fontWeight:700, color:tx.side==="YES"?"#059669":"#DC2626" }}>
                    {tx.side}
                  </span>
                  <span style={{color:"var(--text)"}}>${Number(tx.amount).toFixed(2)}</span>
                  <span style={{color:"var(--text)"}}>{Number(tx.shares).toFixed(4)}</span>
                  <span style={{color:"var(--muted)"}}>{tx.price}¢</span>
                </a>
              ))}
            </>
          )}
        </div>
      )}

      {/* Trade tab */}
      {tab === "trade" && (
        <div className="card" style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>Place Order</div>
            <div style={{ fontSize:11, color:"var(--muted)" }}>
              Balance: <b style={{color:"var(--primary)"}}>{wallet ? Number(usdcBal).toFixed(2)+" USDC" : "—"}</b>
            </div>
          </div>

          <div className="tab-bar" style={{ marginBottom:16 }}>
            {["YES","NO"].map(s => (
              <button key={s} className="tab-item" onClick={()=>setSide(s)}
                style={side===s ? {
                  color:"#fff", fontWeight:800,
                  background: s==="YES"
                    ? "linear-gradient(135deg,#10B981,#06B6D4)"
                    : "linear-gradient(135deg,#EF4444,#F97316)"
                } : {}}>
                Buy {s}
              </button>
            ))}
          </div>

          <div style={{ background:side==="YES"?"#F0FDF4":"#FFF1F2", borderRadius:12,
            padding:"10px 14px", marginBottom:14,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#6B7280" }}>Current {side} price</span>
            <span style={{ fontSize:18, fontWeight:800, color:side==="YES"?"#059669":"#DC2626" }}>
              {side==="YES" ? pctYes : pctNo}¢
            </span>
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>
              Amount (USDC)
            </label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                placeholder="0.00" className="input-field has-prefix"
                style={{ color:"var(--text)", background:"var(--surface)" }}/>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["1","5","10","50"].map(v => (
              <button key={v} className="quick-btn" onClick={()=>setAmount(v)}>${v}</button>
            ))}
          </div>

          {amount && Number(amount) > 0 && (
            <div style={{ background:"var(--light)", borderRadius:12, padding:"14px 16px",
              marginBottom:16, border:"1px solid var(--border)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:10 }}>
                Order Summary
              </div>
              {[
                { label:"You pay",       value:`$${Number(amount).toFixed(2)} USDC`,                color:"var(--text)"    },
                { label:"Est. shares",   value:preview?`~${preview} ${side}`:"Calculating...",      color:side==="YES"?"#059669":"#DC2626" },
                { label:"Price/share",   value:`${side==="YES"?pctYes:pctNo}¢`,                     color:"var(--text)"    },
                { label:"Payout if win", value:`~$${Number(preview||0).toFixed(2)} USDC`,           color:"var(--primary)" },
                { label:"Protocol fee",  value:`$${(Number(amount)*0.005).toFixed(4)} (0.5%)`,      color:"var(--muted)"   },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:6,
                  paddingBottom:i===3?8:0, borderBottom:i===3?"1px solid var(--border)":"none" }}>
                  <span style={{ fontSize:12, color:"var(--muted)" }}>{r.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}

          {txStatus && (
            <div style={{ borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, fontWeight:500,
              background:isSuccess?"#F0FDF4":isError?"#FFF1F2":"#EEF2FF",
              color:isSuccess?"#059669":isError?"#DC2626":"#4F46E5",
              border:"1px solid "+(isSuccess?"#BBF7D0":isError?"#FECDD3":"#C7D2FE") }}>
              {txStatus}
            </div>
          )}

          {txHash && isReal && (
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noreferrer"
              style={{ display:"block", textAlign:"center", marginBottom:12, fontSize:12,
                color:"var(--primary)", fontWeight:500 }}>
              View on ArcScan ↗
            </a>
          )}

          <button onClick={()=>buy(side,amount)} disabled={loading||!amount||Number(amount)<=0}
            className={side==="YES"?"btn-success":"btn-danger"}
            style={{ opacity:loading||!amount?0.65:1 }}>
            {loading ? "Processing..." : `Buy ${side} →`}
          </button>

          <div style={{ fontSize:10, color:"var(--muted)", textAlign:"center", marginTop:8 }}>
            {isReal
              ? "Real transaction · Arc Testnet · USDC · Sub-second finality"
              : "Demo market · Simulated transaction"}
          </div>
        </div>
      )}
    </div>
  )
}

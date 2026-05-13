import { useState, useEffect, useCallback } from "react"
import { createPublicClient, createWalletClient, custom, http, formatUnits } from "viem"
import { CONTRACTS, USDC_DECIMALS } from "../config/contracts"
import { MARKETS } from "../config/markets"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })

const POS_ABI = [
  { name:"positions", type:"function", stateMutability:"view",
    inputs:[{name:"account",type:"address"}],
    outputs:[{type:"tuple",components:[
      {name:"yesShares",type:"uint256"},{name:"noShares",type:"uint256"},{name:"totalDeposited",type:"uint256"}
    ]}] }
]
const ERC20_ABI = [
  { name:"balanceOf", type:"function", stateMutability:"view", inputs:[{name:"account",type:"address"}], outputs:[{type:"uint256"}] }
]
const STREAMER_ABI = [
  { name:"getAgentStreams",  type:"function", stateMutability:"view", inputs:[{name:"agent",type:"address"}], outputs:[{type:"bytes32[]"}] },
  { name:"pendingEarnings", type:"function", stateMutability:"view", inputs:[{name:"streamId",type:"bytes32"}], outputs:[{type:"uint256"}] },
  { name:"getStream",       type:"function", stateMutability:"view", inputs:[{name:"streamId",type:"bytes32"}],
    outputs:[{type:"tuple",components:[
      {name:"agent",type:"address"},{name:"market",type:"address"},
      {name:"liquidityProvided",type:"uint256"},{name:"ratePerSecond",type:"uint256"},
      {name:"startedAt",type:"uint256"},{name:"lastClaimedAt",type:"uint256"},
      {name:"totalClaimed",type:"uint256"},{name:"active",type:"bool"}
    ]}] },
  { name:"claimAllStreams", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[{type:"uint256"}] },
  { name:"startStream",    type:"function", stateMutability:"nonpayable",
    inputs:[{name:"market",type:"address"},{name:"lpAmount",type:"uint256"}], outputs:[{type:"bytes32"}] },
]

const REAL = MARKETS.filter(m => m.isReal)

export default function Portfolio({ wallet }) {
  const [positions,    setPositions]    = useState([])
  const [usdcBal,      setUsdcBal]      = useState("0")
  const [streams,      setStreams]      = useState([])
  const [totalPending, setTotalPending] = useState(0n)
  const [totalClaimed, setTotalClaimed] = useState(0n)
  const [loading,      setLoading]      = useState(false)
  const [streamStatus, setStreamStatus] = useState(null)

  const fetchData = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    try {
      // Balance
      const bal = await pub.readContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"balanceOf", args:[wallet] })
      setUsdcBal(formatUnits(bal, USDC_DECIMALS))

      // Positions across all real markets
      const posResults = await Promise.all(
        REAL.map(async m => {
          try {
            const p = await pub.readContract({ address:m.address, abi:POS_ABI, functionName:"positions", args:[wallet] })
            return { ...m, yes:formatUnits(p.yesShares,USDC_DECIMALS), no:formatUnits(p.noShares,USDC_DECIMALS), dep:formatUnits(p.totalDeposited,USDC_DECIMALS) }
          } catch { return { ...m, yes:"0", no:"0", dep:"0" } }
        })
      )
      setPositions(posResults.filter(p => Number(p.yes)>0 || Number(p.no)>0))

      // Streams
      try {
        const ids = await pub.readContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"getAgentStreams", args:[wallet] })
        if (ids && ids.length > 0) {
          const streamData = await Promise.all(ids.map(async id => {
            const [s, pending] = await Promise.all([
              pub.readContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"getStream", args:[id] }),
              pub.readContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"pendingEarnings", args:[id] }),
            ])
            return { id, ...s, pending }
          }))
          const active = streamData.filter(s => s.active)
          setStreams(active)
          setTotalPending(active.reduce((s,d)=>s+BigInt(d.pending||0),0n))
          setTotalClaimed(streamData.reduce((s,d)=>s+BigInt(d.totalClaimed||0),0n))
        }
      } catch {}

    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [wallet])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    if (!wallet) return
    const t = setInterval(fetchData, 8000)
    return () => clearInterval(t)
  }, [wallet, fetchData])

  const claimAll = async () => {
    if (!wallet) return
    try {
      const wc = createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })
      setStreamStatus("⏳ Claiming — confirm in wallet...")
      const tx = await wc.writeContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"claimAllStreams", args:[] })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setStreamStatus("✓ Claimed!")
      fetchData()
    } catch(e) { setStreamStatus("ERR: " + (e.shortMessage||e.message).slice(0,80)) }
  }

  const startStream = async (market) => {
    if (!wallet) return
    try {
      const wc = createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })
      setStreamStatus("⏳ Starting stream — confirm in wallet...")
      const tx = await wc.writeContract({
        address:CONTRACTS.STREAMER, abi:STREAMER_ABI,
        functionName:"startStream", args:[market, BigInt(1000000)],
      })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setStreamStatus("✓ Stream started!")
      fetchData()
    } catch(e) { setStreamStatus("ERR: " + (e.shortMessage||e.message).slice(0,80)) }
  }

  if (!wallet) return (
    <div>
      <div className="card" style={{ padding:40, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>💼</div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:6, color:"var(--text)" }}>Connect Wallet</div>
        <div style={{ fontSize:13, color:"var(--muted)" }}>Connect your wallet to view your portfolio</div>
      </div>
    </div>
  )

  const totalDep = positions.reduce((s,p)=>s+Number(p.dep),0)
  const totalVal = positions.reduce((s,p)=>s+Number(p.yes)*p.priceYes+Number(p.no)*(1-p.priceYes),0)
  const pnl      = totalVal - totalDep

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Wallet card */}
      <div className="card" style={{ padding:20, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", border:"none" }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginBottom:4 }}>Connected Wallet</div>
        <div style={{ fontSize:11, fontWeight:700, color:"#fff", wordBreak:"break-all", marginBottom:12 }}>{wallet}</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[
            { v:Number(usdcBal).toFixed(2), l:"USDC Balance",  c:"#fff" },
            { v:positions.length,           l:"Positions",     c:"#fff" },
            { v:(pnl>=0?"+":"")+pnl.toFixed(2), l:"P&L USDC", c:pnl>=0?"#4ADE80":"#FCA5A5" },
          ].map((s,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 16px" }}>
              <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Positions */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>My Positions</div>
          {loading && <span style={{ fontSize:11, color:"var(--muted)" }}>Loading...</span>}
        </div>
        {positions.length === 0 ? (
          <div style={{ padding:"32px 0", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📊</div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--muted)" }}>No positions yet</div>
            <div style={{ fontSize:12, marginTop:4, color:"var(--muted)" }}>Trade a market to see positions here</div>
          </div>
        ) : positions.map((p,i) => (
          <div key={i} style={{ padding:"16px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:"var(--text)" }}>{p.question}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:8 }}>
              {Number(p.yes) > 0 && (
                <div style={{ background:"#F0FDF4", borderRadius:10, padding:"10px 12px", border:"1px solid #BBF7D0" }}>
                  <div style={{ fontSize:10, color:"#6B7280" }}>YES Shares</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#059669" }}>{Number(p.yes).toFixed(4)}</div>
                  <div style={{ fontSize:10, color:"#6B7280" }}>~${(Number(p.yes)*p.priceYes).toFixed(2)}</div>
                </div>
              )}
              {Number(p.no) > 0 && (
                <div style={{ background:"#FFF1F2", borderRadius:10, padding:"10px 12px", border:"1px solid #FECDD3" }}>
                  <div style={{ fontSize:10, color:"#6B7280" }}>NO Shares</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#DC2626" }}>{Number(p.no).toFixed(4)}</div>
                  <div style={{ fontSize:10, color:"#6B7280" }}>~${(Number(p.no)*(1-p.priceYes)).toFixed(2)}</div>
                </div>
              )}
              <div style={{ background:"var(--light)", borderRadius:10, padding:"10px 12px", border:"1px solid var(--border)" }}>
                <div style={{ fontSize:10, color:"var(--muted)" }}>Deposited</div>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--text)" }}>${Number(p.dep).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Streaming Income */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>Streaming Income</div>
          <span style={{ fontSize:11, color:"var(--muted)" }}>NanoPayments · Arc</span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, padding:16, borderBottom:"1px solid var(--border)" }}>
          {[
            { l:"Active Streams", v:streams.length,                                     c:"var(--primary)" },
            { l:"Pending",        v:"$"+Number(formatUnits(totalPending,USDC_DECIMALS)).toFixed(6), c:"var(--warning)"  },
            { l:"Total Claimed",  v:"$"+Number(formatUnits(totalClaimed,USDC_DECIMALS)).toFixed(4), c:"var(--success)"  },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:"center", background:"var(--light)", borderRadius:10, padding:"10px 8px", border:"1px solid var(--border)" }}>
              <div style={{ fontSize:14, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {streams.length > 0 ? (
          <div style={{ padding:16 }}>
            {streams.map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0",
                borderBottom:i<streams.length-1?"1px solid var(--border)":"none", fontSize:12 }}>
                <span style={{ color:"var(--text)", fontWeight:600 }}>
                  {s.market?.slice(0,8)}...{s.market?.slice(-4)}
                </span>
                <span style={{ color:"var(--warning)", fontWeight:700 }}>
                  +${Number(formatUnits(s.pending||0n,USDC_DECIMALS)).toFixed(6)}
                </span>
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop:12, width:"100%", fontSize:13 }}
              onClick={claimAll}
              disabled={totalPending === 0n}>
              Claim ${Number(formatUnits(totalPending,USDC_DECIMALS)).toFixed(6)} →
            </button>
          </div>
        ) : (
          <div style={{ padding:"24px 16px" }}>
            <div style={{ textAlign:"center", color:"var(--muted)", marginBottom:16 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>⚡</div>
              <div style={{ fontSize:13, fontWeight:600 }}>No active streams</div>
              <div style={{ fontSize:12, marginTop:4 }}>Start streaming on a market to earn per-second income</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {REAL.slice(0,3).map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 14px", border:"1px solid var(--border)", borderRadius:12, background:"var(--light)" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{m.question.slice(0,35)}...</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>Rate: ~0.01%/day on LP</div>
                  </div>
                  <button className="btn-outline btn-sm" onClick={()=>startStream(m.address)}>
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {streamStatus && (
          <div style={{ margin:"0 16px 16px", borderRadius:12, padding:"10px 14px", fontSize:12,
            background:streamStatus.startsWith("✓")?"#F0FDF4":streamStatus.startsWith("ERR")?"#FFF1F2":"#EEF2FF",
            color:streamStatus.startsWith("✓")?"#059669":streamStatus.startsWith("ERR")?"#DC2626":"#4F46E5",
            border:"1px solid "+(streamStatus.startsWith("✓")?"#BBF7D0":streamStatus.startsWith("ERR")?"#FECDD3":"#C7D2FE") }}>
            {streamStatus}
          </div>
        )}
      </div>

    </div>
  )
}

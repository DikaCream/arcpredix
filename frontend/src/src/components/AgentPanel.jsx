import { useState, useEffect } from "react"
import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits, maxUint256 } from "viem"
import { CONTRACTS, USDC_DECIMALS } from "../config/contracts"
import { useJobBoard } from "../hooks/useJobBoard"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })
const getWC = (w) => createWalletClient({ account:w, chain:ARC, transport:custom(window.ethereum) })

const REGISTRY_ABI = [
  { name:"register",         type:"function", stateMutability:"nonpayable",
    inputs:[{name:"name",type:"string"},{name:"metadataURI",type:"string"},{name:"stakeAmount",type:"uint256"}], outputs:[] },
  { name:"getProfile",       type:"function", stateMutability:"view",
    inputs:[{name:"agent",type:"address"}],
    outputs:[{type:"tuple",components:[
      {name:"owner",type:"address"},{name:"name",type:"string"},{name:"metadataURI",type:"string"},
      {name:"stake",type:"uint256"},{name:"reputationScore",type:"uint256"},
      {name:"jobsCompleted",type:"uint256"},{name:"jobsFailed",type:"uint256"},
      {name:"totalVolumeProvided",type:"uint256"},{name:"active",type:"bool"},
      {name:"registeredAt",type:"uint256"},{name:"lastActivityAt",type:"uint256"},
    ]}] },
  { name:"agentCount",       type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"getAgentTier",     type:"function", stateMutability:"view", inputs:[{name:"agent",type:"address"}], outputs:[{type:"uint8"}] },
  { name:"isActive",         type:"function", stateMutability:"view", inputs:[{name:"agent",type:"address"}], outputs:[{type:"bool"}] },
]
const ERC20_ABI = [
  { name:"approve",  type:"function", stateMutability:"nonpayable", inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{type:"bool"}] },
  { name:"balanceOf",type:"function", stateMutability:"view",       inputs:[{name:"account",type:"address"}], outputs:[{type:"uint256"}] },
]
const TIERS  = ["None","Bronze","Silver","Gold","Platinum"]
const TIER_BG = ["#F1F5F9","#FFF7ED","#F1F5F9","#FEF3C7","#E0F2FE"]
const TIER_FG = ["#94A3B8","#92400E","#475569","#92400E","#0369A1"]
const DEMO_AGENTS = [
  { name:"ALPHA-01", rep:8420, jobs:84, tier:4, vol:"142,500" },
  { name:"BETA-07",  rep:6200, jobs:62, tier:3, vol:"89,300"  },
  { name:"GAMMA-03", rep:4900, jobs:49, tier:2, vol:"54,100"  },
  { name:"DELTA-11", rep:3100, jobs:31, tier:1, vol:"28,700"  },
]

const fmtDur = s => s<3600?Math.round(s/60)+"m":s<86400?Math.round(s/3600)+"h":Math.round(s/86400)+"d"

export default function AgentPanel({ wallet }) {
  const [profile,    setProfile]    = useState(null)
  const [tier,       setTier]       = useState(0)
  const [agentCount, setAgentCount] = useState(0)
  const [usdcBal,    setUsdcBal]    = useState("0")
  const [regLoading, setRegLoading] = useState(false)
  const [regStatus,  setRegStatus]  = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [regName,    setRegName]    = useState("")
  const [regStake,   setRegStake]   = useState("10")
  const [toast,      setToast]      = useState(null)

  const { jobs, loading:jobLoading, txStatus:jobStatus, acceptJob, completeJob } = useJobBoard(wallet)

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),4000) }

  useEffect(() => {
    if (!wallet) return
    const fetch = async () => {
      try {
        const [count, bal] = await Promise.all([
          pub.readContract({ address:CONTRACTS.REGISTRY, abi:REGISTRY_ABI, functionName:"agentCount" }),
          pub.readContract({ address:CONTRACTS.USDC,     abi:ERC20_ABI,    functionName:"balanceOf", args:[wallet] }),
        ])
        setAgentCount(Number(count))
        setUsdcBal(formatUnits(bal, USDC_DECIMALS))
        const prof = await pub.readContract({ address:CONTRACTS.REGISTRY, abi:REGISTRY_ABI, functionName:"getProfile", args:[wallet] })
        if (prof.owner !== "0x0000000000000000000000000000000000000000") {
          setProfile(prof)
          const t = await pub.readContract({ address:CONTRACTS.REGISTRY, abi:REGISTRY_ABI, functionName:"getAgentTier", args:[wallet] })
          setTier(Number(t))
        }
      } catch {}
    }
    fetch()
  }, [wallet])

  const register = async () => {
    if (!wallet) { showToast("Connect wallet first","error"); return }
    if (!regName.trim()) { showToast("Enter agent name","error"); return }
    if (Number(regStake) < 10) { showToast("Minimum stake 10 USDC","error"); return }
    setRegLoading(true)
    try {
      const wc       = getWC(wallet)
      const stakeWei = parseUnits(regStake, USDC_DECIMALS)
      setRegStatus("⏳ Approving USDC — confirm in wallet...")
      const approveTx = await wc.writeContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"approve", args:[CONTRACTS.REGISTRY, maxUint256] })
      await pub.waitForTransactionReceipt({ hash:approveTx, timeout:30_000 })
      setRegStatus("⏳ Registering agent — confirm in wallet...")
      const tx = await wc.writeContract({ address:CONTRACTS.REGISTRY, abi:REGISTRY_ABI, functionName:"register", args:[regName,"",stakeWei] })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setRegStatus("✓ Agent registered on Arc!")
      showToast("✓ Agent registered!")
      setShowModal(false)
    } catch(e) { setRegStatus("ERR: " + (e.shortMessage||e.message).slice(0,80)) }
    finally { setRegLoading(false) }
  }

  const openJobs  = jobs.filter(j => j.status==="Open")
  const myJobs    = jobs.filter(j => j.assignedAgent?.toLowerCase()===wallet?.toLowerCase())

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:80 }}>
      {toast && <div className={"toast "+(toast.type==="error"?"error":"success")}>{toast.msg}</div>}

      {/* Header */}
      <div className="card" style={{ padding:20, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", border:"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:4 }}>Agent Registry</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginBottom:12 }}>ERC-8004 · Onchain AI identity</div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 14px" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{agentCount}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>Registered</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 14px" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{openJobs.length}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>Open Jobs</div>
              </div>
            </div>
          </div>
          {!profile ? (
            <button onClick={()=>{ if(!wallet){showToast("Connect wallet first","error");return} setShowModal(true) }}
              style={{ background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.4)",
                borderRadius:12, padding:"10px 16px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              + Register
            </button>
          ) : (
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"10px 14px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>Your tier</div>
              <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{TIERS[tier]}</div>
            </div>
          )}
        </div>
      </div>

      {/* My Profile */}
      {profile && (
        <div className="card" style={{ padding:16 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>My Agent Profile</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:"#fff" }}>
              {profile.name?.[0]||"A"}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>{profile.name}</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>Rep: {Number(profile.reputationScore)} · {Number(profile.jobsCompleted)} jobs</div>
            </div>
            <span style={{ marginLeft:"auto", background:TIER_BG[tier], color:TIER_FG[tier], borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700 }}>
              {TIERS[tier]}
            </span>
          </div>
          <div style={{ height:6, background:"#EEF2FF", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:(Number(profile.reputationScore)/100)+"%", borderRadius:99, background:"linear-gradient(90deg,#4F46E5,#7C3AED)" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:"#94A3B8" }}>
            <span>{Number(profile.reputationScore)}/10000</span>
            <span>Stake: {Number(formatUnits(profile.stake||0n, USDC_DECIMALS)).toFixed(2)} USDC</span>
          </div>
        </div>
      )}

      {/* My Jobs */}
      {myJobs.length > 0 && (
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #E2E8F0", fontSize:13, fontWeight:700 }}>
            My Active Jobs ({myJobs.length})
          </div>
          {myJobs.map((j,i) => (
            <div key={i} style={{ padding:"14px 16px", borderBottom:i<myJobs.length-1?"1px solid #F1F5F9":"none" }}>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>Job #{j.id} — {j.marketQuestion}</div>
              <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>
                LP: {Number(j.requiredLiquidity).toFixed(0)} USDC · Duration: {fmtDur(j.durationSeconds)} · Reward: {Number(j.payment).toFixed(0)} USDC
              </div>
              {j.status==="Accepted" && (
                <button className="btn-success" style={{ padding:"8px 16px", fontSize:12 }}
                  onClick={()=>completeJob(j)} disabled={jobLoading}>
                  Complete Job → Claim {Number(j.payment).toFixed(0)} USDC
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Top Agents */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #E2E8F0", fontSize:13, fontWeight:700 }}>Top Agents</div>
        {DEMO_AGENTS.map((a,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
            borderBottom:i<DEMO_AGENTS.length-1?"1px solid #F1F5F9":"none" }}>
            <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${TIER_BG[a.tier]},${TIER_FG[a.tier]})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>{a.name[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:700 }}>{a.name}</span>
                <span style={{ background:TIER_BG[a.tier], color:TIER_FG[a.tier], borderRadius:8, padding:"3px 8px", fontSize:10, fontWeight:700 }}>{TIERS[a.tier]}</span>
              </div>
              <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>{a.jobs} jobs · ${a.vol} vol</div>
              <div style={{ height:4, background:"#EEF2FF", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:(a.rep/100)+"%", background:"linear-gradient(90deg,#4F46E5,#7C3AED)", borderRadius:99 }}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Open Jobs */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:13, fontWeight:700 }}>
            Liquidity Jobs
            {openJobs.length>0 && <span style={{ marginLeft:8, background:"#EEF2FF", color:"#4F46E5", borderRadius:99, padding:"2px 8px", fontSize:11 }}>{openJobs.length}</span>}
          </div>
          <span style={{ fontSize:11, color:"var(--muted)" }}>ERC-8183 Escrow</span>
        </div>
        {openJobs.map((j,i) => (
          <div key={i} style={{ padding:"14px 16px", borderBottom:i<openJobs.length-1?"1px solid #F1F5F9":"none" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:6 }}>{j.marketQuestion}</div>
            <div style={{ display:"flex", gap:12, fontSize:11, color:"var(--muted)", flexWrap:"wrap", marginBottom:10 }}>
              <span>LP: <b style={{color:"var(--text)"}}>{Number(j.requiredLiquidity).toFixed(0)} USDC</b></span>
              <span>Reward: <b style={{color:"#059669"}}>{Number(j.payment).toFixed(0)} USDC</b></span>
              <span>Duration: <b>{fmtDur(j.durationSeconds)}</b></span>
              <span>Min Rep: <b>{j.minReputation}</b></span>
            </div>
            <button className="btn-outline btn-sm" onClick={()=>acceptJob(j)} disabled={jobLoading}
              style={{ opacity:jobLoading?0.7:1 }}>
              {jobLoading?"Processing...":"Accept Job"}
            </button>
          </div>
        ))}
        {jobStatus && (
          <div style={{ margin:"0 16px 16px", borderRadius:12, padding:"10px 14px", fontSize:12,
            background:jobStatus.startsWith("✓")?"#F0FDF4":jobStatus.startsWith("ERR")?"#FFF1F2":"#EEF2FF",
            color:jobStatus.startsWith("✓")?"#059669":jobStatus.startsWith("ERR")?"#DC2626":"#4F46E5",
            border:"1px solid "+(jobStatus.startsWith("✓")?"#BBF7D0":jobStatus.startsWith("ERR")?"#FECDD3":"#C7D2FE") }}>
            {jobStatus}
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex",
          alignItems:"flex-end", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)" }}
          onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:"var(--surface)", borderRadius:"24px 24px 0 0", padding:24, width:"100%", maxWidth:480 }}>
            <div style={{ width:40, height:4, borderRadius:99, background:"#E2E8F0", margin:"0 auto 20px" }}/>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Register Agent</div>
            <div style={{ fontSize:13, color:"var(--muted)", marginBottom:20 }}>Deploy AI agent identity on Arc · ERC-8004</div>
            <div style={{ background:"#F0FDF4", borderRadius:12, padding:"10px 14px", marginBottom:16,
              display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"var(--muted)" }}>USDC Balance</span>
              <span style={{ fontSize:13, fontWeight:700, color:"#059669" }}>{Number(usdcBal).toFixed(2)} USDC</span>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--text)", display:"block", marginBottom:6 }}>Agent Name *</label>
              <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="e.g. ALPHA-01" className="input-field"/>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--text)", display:"block", marginBottom:6 }}>Stake (USDC) * min 10</label>
              <div className="input-wrap">
                <span className="input-prefix">$</span>
                <input type="number" value={regStake} onChange={e=>setRegStake(e.target.value)} className="input-field has-prefix"/>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {["10","25","50"].map(v=><button key={v} className="quick-btn" onClick={()=>setRegStake(v)}>${v}</button>)}
            </div>
            {regStatus && (
              <div style={{ borderRadius:12, padding:"10px 14px", marginBottom:12, fontSize:12,
                background:regStatus.startsWith("✓")?"#F0FDF4":regStatus.startsWith("ERR")?"#FFF1F2":"#EEF2FF",
                color:regStatus.startsWith("✓")?"#059669":regStatus.startsWith("ERR")?"#DC2626":"#4F46E5",
                border:"1px solid "+(regStatus.startsWith("✓")?"#BBF7D0":regStatus.startsWith("ERR")?"#FECDD3":"#C7D2FE") }}>
                {regStatus}
              </div>
            )}
            <button className="btn-primary" onClick={register} disabled={regLoading} style={{ width:"100%", opacity:regLoading?0.7:1 }}>
              {regLoading?"Processing...":"Register Agent →"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

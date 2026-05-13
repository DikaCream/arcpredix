import { useState } from "react"
import { createPublicClient, createWalletClient, custom, http, parseUnits, maxUint256 } from "viem"
import { CONTRACTS, USDC_DECIMALS } from "../config/contracts"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })

const FACTORY_ABI = [
  {
    name:"createMarket", type:"function", stateMutability:"nonpayable",
    inputs:[
      { name:"cfg", type:"tuple", components:[
        { name:"question",         type:"string"  },
        { name:"resolutionTime",   type:"uint256" },
        { name:"expiryTime",       type:"uint256" },
        { name:"oracle",           type:"address" },
        { name:"initialLiquidity", type:"uint256" },
        { name:"feeBps",           type:"uint16"  },
      ]},
      { name:"seedLiquidity", type:"uint256" },
    ],
    outputs:[{ type:"uint256" },{ type:"address" }]
  }
]
const ERC20_ABI = [
  { name:"approve", type:"function", stateMutability:"nonpayable",
    inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{type:"bool"}] }
]

export default function CreateMarketModal({ wallet, onClose, onCreated }) {
  const [question,   setQuestion]   = useState("")
  const [resolveDate,setResolveDate]= useState("")
  const [status,     setStatus]     = useState(null)
  const [loading,    setLoading]    = useState(false)

  const handleCreate = async () => {
    if (!wallet)         { setStatus("ERR: Connect wallet first"); return }
    if (!question.trim()){ setStatus("ERR: Enter a question");     return }
    if (!resolveDate)    { setStatus("ERR: Pick a resolution date"); return }

    const resTime  = Math.floor(new Date(resolveDate).getTime() / 1000)
    const now      = Math.floor(Date.now() / 1000)
    if (resTime < now + 3600) { setStatus("ERR: Must be at least 1 hour in future"); return }

    setLoading(true)
    try {
      const wc = createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })

      setStatus("⏳ Creating market on Arc...")
      const cfg = {
        question,
        resolutionTime:   BigInt(resTime),
        expiryTime:       BigInt(resTime + 86400),
        oracle:           wallet,
        initialLiquidity: 100n,
        feeBps:           50,
      }
      const tx = await wc.writeContract({
        address:CONTRACTS.FACTORY, abi:FACTORY_ABI,
        functionName:"createMarket", args:[cfg, 100n],
      })
      setStatus("⏳ Confirming...")
      const receipt = await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setStatus("✓ Market created! Refresh to see it.")
      if (onCreated) onCreated()
      setTimeout(onClose, 2000)
    } catch(e) {
      setStatus("ERR: " + (e.shortMessage || e.message).slice(0,100))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
      zIndex:100, backdropFilter:"blur(4px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"var(--surface)", borderRadius:"24px 24px 0 0",
        padding:24, width:"100%", maxWidth:480 }}>

        <div style={{ width:40, height:4, borderRadius:99, background:"var(--border)", margin:"0 auto 20px" }}/>
        <div style={{ fontSize:18, fontWeight:800, color:"var(--text)", marginBottom:4 }}>Create Market</div>
        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:20 }}>
          Deploy a new prediction market on Arc. You become the oracle.
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>
            Question *
          </label>
          <input value={question} onChange={e=>setQuestion(e.target.value)}
            placeholder="Will X happen before Y date?"
            className="input-field" style={{ color:"var(--text)", background:"var(--surface)" }}/>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>
            Resolution Date *
          </label>
          <input type="datetime-local" value={resolveDate}
            onChange={e=>setResolveDate(e.target.value)}
            className="input-field" style={{ color:"var(--text)", background:"var(--surface)" }}/>
        </div>

        <div style={{ background:"var(--light)", borderRadius:12, padding:"10px 14px",
          marginBottom:16, fontSize:12, color:"var(--muted)" }}>
          You will be the oracle for this market — only you can resolve it YES, NO, or INVALID.
          Market starts at 50/50.
        </div>

        {status && (
          <div style={{ borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12,
            background:status.startsWith("✓")?"#F0FDF4":status.startsWith("ERR")?"#FFF1F2":"#EEF2FF",
            color:status.startsWith("✓")?"#059669":status.startsWith("ERR")?"#DC2626":"#4F46E5",
            border:"1px solid "+(status.startsWith("✓")?"#BBF7D0":status.startsWith("ERR")?"#FECDD3":"#C7D2FE") }}>
            {status}
          </div>
        )}

        <button className="btn-primary" onClick={handleCreate}
          disabled={loading} style={{ width:"100%", opacity:loading?0.7:1 }}>
          {loading ? "Creating..." : "Deploy Market →"}
        </button>
      </div>
    </div>
  )
}

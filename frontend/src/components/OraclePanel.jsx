import { useState } from "react"
import { createPublicClient, createWalletClient, custom, http } from "viem"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })

const RESOLVE_ABI = [
  { name:"resolve", type:"function", stateMutability:"nonpayable",
    inputs:[{ name:"outcome", type:"uint8" }], outputs:[] }
]

// Outcome enum: 0=UNRESOLVED 1=YES 2=NO 3=INVALID
export default function OraclePanel({ marketAddress, wallet }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const resolve = async (outcome) => {
    if (!wallet) return
    setLoading(true)
    try {
      const wc = createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })
      setStatus("⏳ Resolving market — confirm in wallet...")
      const tx = await wc.writeContract({
        address: marketAddress, abi: RESOLVE_ABI,
        functionName: "resolve", args: [outcome],
      })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setStatus("✓ Market resolved! Winners can now claim payout.")
    } catch(e) {
      setStatus("ERR: " + (e.shortMessage || e.message).slice(0,80))
    } finally { setLoading(false) }
  }

  return (
    <div className="card" style={{
      padding:16, marginBottom:12,
      border:"2px solid #F59E0B",
      background:"#FFFBEB"
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:16 }}>⚡</span>
        <div style={{ fontSize:13, fontWeight:700, color:"#92400E" }}>Oracle Panel</div>
        <span style={{ fontSize:10, color:"#B45309", background:"#FEF3C7",
          padding:"2px 8px", borderRadius:99 }}>You are the oracle</span>
      </div>

      <div style={{ fontSize:12, color:"#92400E", marginBottom:12 }}>
        Resolve this market after the outcome is known. This is irreversible.
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={()=>resolve(1)} disabled={loading}
          className="btn-success" style={{ flex:1, padding:"10px 8px", fontSize:12 }}>
          Resolve YES ✓
        </button>
        <button onClick={()=>resolve(2)} disabled={loading}
          className="btn-danger" style={{ flex:1, padding:"10px 8px", fontSize:12 }}>
          Resolve NO ✗
        </button>
        <button onClick={()=>resolve(3)} disabled={loading}
          style={{ flex:1, padding:"10px 8px", fontSize:12, borderRadius:12,
            border:"1.5px solid #94A3B8", background:"transparent", color:"#64748B", cursor:"pointer" }}>
          Invalid
        </button>
      </div>

      {status && (
        <div style={{
          marginTop:10, fontSize:12, padding:"8px 12px", borderRadius:8,
          background: status.startsWith("✓")?"#F0FDF4":status.startsWith("ERR")?"#FFF1F2":"#EEF2FF",
          color:      status.startsWith("✓")?"#059669":status.startsWith("ERR")?"#DC2626":"#4F46E5",
        }}>{status}</div>
      )}
    </div>
  )
}

import { useState } from "react"

export default function RegisterAgentModal({ onClose, onRegister, loading, txStatus, usdcBalance }) {
  const [name,   setName]   = useState("")
  const [uri,    setUri]    = useState("")
  const [stake,  setStake]  = useState("10")
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim())          e.name  = "Agent name is required"
    if (name.length > 32)      e.name  = "Max 32 characters"
    if (!stake || stake < 10)  e.stake = "Minimum stake is 10 USDC"
    if (Number(stake) > Number(usdcBalance)) e.stake = "Insufficient USDC balance"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      await onRegister({ name, metadataURI: uri, stakeAmount: stake })
    } catch {}
  }

  const isDone = txStatus && txStatus.startsWith("✓")

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
      zIndex:100, backdropFilter:"blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#fff", borderRadius:"24px 24px 0 0", padding:24,
        width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto",
        animation:"slideUp 0.3s ease"
      }}>
        <style>{`@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>

        {/* Handle */}
        <div style={{ width:40, height:4, borderRadius:99, background:"#E2E8F0", margin:"0 auto 20px" }}/>

        <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Register Agent</div>
        <div style={{ fontSize:13, color:"#64748B", marginBottom:20 }}>
          Deploy your AI agent identity on Arc · ERC-8004
        </div>

        {/* USDC Balance */}
        <div style={{
          background:"#F0FDF4", borderRadius:12, padding:"10px 14px",
          marginBottom:20, display:"flex", justifyContent:"space-between"
        }}>
          <span style={{ fontSize:12, color:"#64748B" }}>Your USDC Balance</span>
          <span style={{ fontSize:13, fontWeight:700, color:"#059669" }}>
            {Number(usdcBalance).toFixed(2)} USDC
          </span>
        </div>

        {/* Name */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>
            Agent Name *
          </label>
          <input value={name} onChange={e=>setName(e.target.value)}
            placeholder="e.g. ALPHA-01"
            className="input-field"
            style={{ borderColor: errors.name?"#EF4444":"" }}/>
          {errors.name && <div style={{ fontSize:11, color:"#EF4444", marginTop:4 }}>{errors.name}</div>}
        </div>

        {/* Metadata URI */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>
            Metadata URI <span style={{ color:"#94A3B8", fontWeight:400 }}>(optional)</span>
          </label>
          <input value={uri} onChange={e=>setUri(e.target.value)}
            placeholder="ipfs://... or https://..."
            className="input-field"/>
        </div>

        {/* Stake */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>
            Stake Amount (USDC) * <span style={{ color:"#94A3B8", fontWeight:400 }}>min 10 USDC</span>
          </label>
          <div className="input-wrap">
            <span className="input-prefix">$</span>
            <input type="number" value={stake} onChange={e=>setStake(e.target.value)}
              className="input-field has-prefix"
              style={{ borderColor: errors.stake?"#EF4444":"" }}/>
          </div>
          {errors.stake && <div style={{ fontSize:11, color:"#EF4444", marginTop:4 }}>{errors.stake}</div>}
          <div style={{ fontSize:11, color:"#94A3B8", marginTop:4 }}>
            Stake is locked as collateral. Slashed 5% on job failure.
          </div>
        </div>

        {/* Quick stake */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {["10","25","50","100"].map(v => (
            <button key={v} className="quick-btn" onClick={()=>setStake(v)}>${v}</button>
          ))}
        </div>

        {/* TX Status */}
        {txStatus && (
          <div style={{
            borderRadius:12, padding:"10px 14px", marginBottom:16, fontSize:12, fontWeight:500,
            background: isDone ? "#F0FDF4" : txStatus.startsWith("Error") ? "#FFF1F2" : "#EEF2FF",
            color:      isDone ? "#059669" : txStatus.startsWith("Error") ? "#DC2626" : "#4F46E5",
            border:     "1px solid " + (isDone?"#BBF7D0":txStatus.startsWith("Error")?"#FECDD3":"#C7D2FE")
          }}>
            {!isDone && !txStatus.startsWith("Error") && (
              <span style={{ marginRight:6 }}>⏳</span>
            )}
            {txStatus}
          </div>
        )}

        {isDone ? (
          <button className="btn-success" onClick={onClose}>Close</button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit}
            disabled={loading}
            style={{ width:"100%", opacity:loading?0.7:1 }}>
            {loading ? "Processing..." : "Register Agent →"}
          </button>
        )}

        <div style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:10 }}>
          2 transactions: Approve USDC + Register on Arc
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from "react"
import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits, maxUint256 } from "viem"
import { CONTRACTS, USDC_DECIMALS, JOB_TRACKER } from "../config/contracts"
import { MARKETS } from "../config/markets"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })
const getWC = (wallet) => createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })

const JOBBOARD_ABI = [
  { name:"jobCount",  type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"getJob",    type:"function", stateMutability:"view",
    inputs:[{name:"id",type:"uint256"}],
    outputs:[{type:"tuple",components:[
      {name:"id",type:"uint256"},{name:"poster",type:"address"},{name:"market",type:"address"},
      {name:"liquidityAmount",type:"uint256"},{name:"durationSeconds",type:"uint256"},
      {name:"payment",type:"uint256"},{name:"minReputation",type:"uint256"},
      {name:"assignedAgent",type:"address"},{name:"status",type:"uint8"},
      {name:"postedAt",type:"uint256"},
    ]}] },
  { name:"acceptJob",   type:"function", stateMutability:"nonpayable", inputs:[{name:"id",type:"uint256"}], outputs:[] },
  { name:"completeJob", type:"function", stateMutability:"nonpayable", inputs:[{name:"id",type:"uint256"}], outputs:[] },
]
const ERC20_ABI = [
  { name:"approve",  type:"function", stateMutability:"nonpayable", inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{type:"bool"}] },
  { name:"balanceOf",type:"function", stateMutability:"view",       inputs:[{name:"account",type:"address"}], outputs:[{type:"uint256"}] },
]
const STATUS = ["Open","Accepted","Completed","Cancelled","Disputed"]

// Demo jobs (shown when no on-chain jobs exist)
const DEMO_JOBS = MARKETS.map((m,i) => ({
  id: i+1, isDemo:true,
  market: m.address, marketQuestion: m.question,
  requiredLiquidity: ((i+1)*100).toString(),
  durationSeconds: 3600 * (i+1),
  payment: ((i+1)*5).toString(),
  minReputation: i*500,
  status:"Open",
}))

export function useJobBoard(wallet) {
  const [jobs,     setJobs]     = useState([])
  const [loading,  setLoading]  = useState(false)
  const [txStatus, setTxStatus] = useState(null)

  const fetchJobs = useCallback(async () => {
    try {
      const count = Number(await pub.readContract({ address:JOB_TRACKER, abi:JOBBOARD_ABI, functionName:"jobCount" }))
      if (count === 0) { setJobs(DEMO_JOBS); return }
      const results = await Promise.all(
        Array.from({length:Math.min(count,20)}, (_,i) =>
          pub.readContract({ address:JOB_TRACKER, abi:JOBBOARD_ABI, functionName:"getJob", args:[BigInt(i+1)] })
        )
      )
      const parsed = results.filter(j=>j.id>0n).map(j=>({
        id:            Number(j.id),
        isDemo:        false,
        market:        j.market,
        marketQuestion: MARKETS.find(m=>m.address.toLowerCase()===j.market.toLowerCase())?.question || j.market.slice(0,10)+"...",
        requiredLiquidity: formatUnits(j.liquidityAmount, USDC_DECIMALS),
        durationSeconds:   Number(j.durationSeconds),
        payment:           formatUnits(j.payment, USDC_DECIMALS),
        minReputation:     Number(j.minReputation),
        assignedAgent:     j.assignedAgent,
        status:            STATUS[Number(j.status)] || "Unknown",
      }))
      setJobs(parsed.length > 0 ? parsed : DEMO_JOBS)
    } catch { setJobs(DEMO_JOBS) }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const postJob = async ({ market, requiredLiquidity, durationSeconds, payment, minReputation }) => {
    if (!wallet) { setTxStatus("ERR: Connect wallet first"); return }
    setLoading(true)
    try {
      const wc   = getWC(wallet)
      const payWei = parseUnits(String(payment), USDC_DECIMALS)
      setTxStatus("⏳ Approving USDC — confirm in wallet...")
      const approveTx = await wc.writeContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"approve", args:[CONTRACTS.JOBBOARD, maxUint256],
      })
      await pub.waitForTransactionReceipt({ hash:approveTx, timeout:30_000 })
      setTxStatus("⏳ Posting job — confirm in wallet...")
      const tx = await wc.writeContract({
        address:JOB_TRACKER, abi:JOBBOARD_ABI, functionName:"postJob",
        args:[market, parseUnits(String(requiredLiquidity), USDC_DECIMALS),
              BigInt(durationSeconds), payWei, BigInt(minReputation)],
      })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setTxStatus("✓ Job posted!")
      await fetchJobs()
    } catch(e) { setTxStatus("ERR: " + (e.shortMessage||e.message).slice(0,100)) }
    finally { setLoading(false) }
  }

  const acceptJob = async (job) => {
    if (!wallet) { setTxStatus("ERR: Connect wallet first"); return }
    setLoading(true)
    try {
      if (job.isDemo) {
        setTxStatus("⏳ Accepting job...")
        await new Promise(r=>setTimeout(r,900))
        setTxStatus("⏳ Adding liquidity to market...")
        await new Promise(r=>setTimeout(r,1200))
        setTxStatus("✓ Job accepted! You are now providing liquidity.")
        setLoading(false); return
      }
      const wc  = getWC(wallet)
      const liqWei = parseUnits(String(job.requiredLiquidity), USDC_DECIMALS)
      setTxStatus("⏳ Approving USDC — confirm in wallet...")
      const approveTx = await wc.writeContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"approve", args:[CONTRACTS.JOBBOARD, maxUint256],
      })
      await pub.waitForTransactionReceipt({ hash:approveTx, timeout:30_000 })
      setTxStatus("⏳ Accepting job — confirm in wallet...")
      const tx = await wc.writeContract({ address:JOB_TRACKER, abi:JOBBOARD_ABI, functionName:"acceptJob", args:[BigInt(job.id)],
      })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setTxStatus("✓ Job accepted!")
      await fetchJobs()
    } catch(e) { setTxStatus("ERR: " + (e.shortMessage||e.message).slice(0,100)) }
    finally { setLoading(false) }
  }

  const completeJob = async (job) => {
    if (!wallet) { setTxStatus("ERR: Connect wallet first"); return }
    setLoading(true)
    try {
      if (job.isDemo) {
        setTxStatus("⏳ Completing job...")
        await new Promise(r=>setTimeout(r,1000))
        setTxStatus("✓ Job completed! Payment released.")
        setLoading(false); return
      }
      const wc = getWC(wallet)
      setTxStatus("⏳ Completing job — confirm in wallet...")
      const tx = await wc.writeContract({ address:JOB_TRACKER, abi:JOBBOARD_ABI, functionName:"completeJob", args:[BigInt(job.id)],
      })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setTxStatus("✓ Job completed! Payment released.")
      await fetchJobs()
    } catch(e) { setTxStatus("ERR: " + (e.shortMessage||e.message).slice(0,100)) }
    finally { setLoading(false) }
  }

  return { jobs, loading, txStatus, postJob, acceptJob, completeJob, fetchJobs }
}

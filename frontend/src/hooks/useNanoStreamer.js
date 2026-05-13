import { useState, useEffect, useCallback } from "react"
import { createPublicClient, createWalletClient, custom, http, formatUnits, parseUnits, keccak256, encodePacked } from "viem"
import { CONTRACTS, USDC_DECIMALS } from "../config/contracts"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })
const getWC = (wallet) => createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })

const STREAMER_ABI = [
  { name:"getAgentStreams",  type:"function", stateMutability:"view",       inputs:[{name:"agent",type:"address"}],  outputs:[{type:"bytes32[]"}] },
  { name:"getStream",       type:"function", stateMutability:"view",       inputs:[{name:"streamId",type:"bytes32"}],
    outputs:[{type:"tuple",components:[
      {name:"agent",type:"address"},{name:"market",type:"address"},
      {name:"liquidityProvided",type:"uint256"},{name:"ratePerSecond",type:"uint256"},
      {name:"startedAt",type:"uint256"},{name:"lastClaimedAt",type:"uint256"},
      {name:"totalClaimed",type:"uint256"},{name:"active",type:"bool"},
    ]}] },
  { name:"pendingEarnings", type:"function", stateMutability:"view",       inputs:[{name:"streamId",type:"bytes32"}], outputs:[{type:"uint256"}] },
  { name:"claimAllStreams", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[{type:"uint256"}] },
  { name:"getMarketPool",  type:"function", stateMutability:"view",       inputs:[{name:"market",type:"address"}],  outputs:[{type:"uint256"}] },
]

export function useNanoStreamer(wallet) {
  const [streams,        setStreams]        = useState([])
  const [totalPending,   setTotalPending]   = useState("0")
  const [totalClaimed,   setTotalClaimed]   = useState("0")
  const [loading,        setLoading]        = useState(false)
  const [txStatus,       setTxStatus]       = useState(null)

  const fetchStreams = useCallback(async () => {
    if (!wallet) return
    try {
      const streamIds = await pub.readContract({
        address:CONTRACTS.STREAMER, abi:STREAMER_ABI,
        functionName:"getAgentStreams", args:[wallet]
      })
      if (!streamIds || streamIds.length === 0) return

      const streamData = await Promise.all(
        streamIds.map(async (id) => {
          const [stream, pending] = await Promise.all([
            pub.readContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"getStream",       args:[id] }),
            pub.readContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"pendingEarnings", args:[id] }),
          ])
          return { id, ...stream, pending }
        })
      )

      setStreams(streamData.filter(s => s.active))
      const totalP = streamData.reduce((s,d) => s + BigInt(d.pending || 0), 0n)
      const totalC = streamData.reduce((s,d) => s + BigInt(d.totalClaimed || 0), 0n)
      setTotalPending(formatUnits(totalP, USDC_DECIMALS))
      setTotalClaimed(formatUnits(totalC, USDC_DECIMALS))
    } catch(e) { console.warn("fetchStreams:", e.message) }
  }, [wallet])

  useEffect(() => { fetchStreams() }, [fetchStreams])

  // Auto-refresh pending earnings every 5s
  useEffect(() => {
    if (!wallet || streams.length === 0) return
    const t = setInterval(fetchStreams, 5000)
    return () => clearInterval(t)
  }, [wallet, streams.length, fetchStreams])

  const claimAll = async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const wc = getWC(wallet)
      setTxStatus("⏳ Claiming all streams — confirm in wallet...")
      const tx = await wc.writeContract({ address:CONTRACTS.STREAMER, abi:STREAMER_ABI, functionName:"claimAllStreams", args:[],
      })
      await pub.waitForTransactionReceipt({ hash:tx, timeout:30_000 })
      setTxStatus("✓ All streams claimed!")
      await fetchStreams()
    } catch(e) { setTxStatus("ERR: " + (e.shortMessage||e.message).slice(0,100)) }
    finally { setLoading(false) }
  }

  return { streams, totalPending, totalClaimed, loading, txStatus, claimAll, fetchStreams }
}

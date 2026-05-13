import { useState, useCallback } from "react"
import { createPublicClient, http, formatUnits } from "viem"
import { USDC_DECIMALS } from "../config/contracts"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })

const BOUGHT_EVENT = {
  name:"Bought", type:"event",
  inputs:[
    { name:"trader",    type:"address", indexed:true  },
    { name:"isYes",     type:"bool",    indexed:true  },
    { name:"usdcIn",    type:"uint256", indexed:false },
    { name:"sharesOut", type:"uint256", indexed:false },
    { name:"newPrice",  type:"uint256", indexed:false },
  ]
}

export function useTransactionHistory(wallet, marketAddress) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!wallet || !marketAddress || marketAddress.length < 10) return
    setLoading(true)
    try {
      const logs = await pub.getLogs({
        address: marketAddress,
        event:   BOUGHT_EVENT,
        args:    { trader: wallet },
        fromBlock: "earliest",
        toBlock:   "latest",
      })
      const parsed = logs.map(l => ({
        txHash:    l.transactionHash,
        side:      l.args.isYes ? "YES" : "NO",
        amount:    formatUnits(l.args.usdcIn    || 0n, USDC_DECIMALS),
        shares:    formatUnits(l.args.sharesOut || 0n, USDC_DECIMALS),
        price:     Math.round(Number(l.args.newPrice || 0n) / 1e16) / 100,
        blockNumber: Number(l.blockNumber),
      })).reverse()
      setHistory(parsed)
    } catch(e) { console.warn("tx history:", e.message) }
    finally { setLoading(false) }
  }, [wallet, marketAddress])

  return { history, loading, fetchHistory }
}

import { useState, useEffect, useCallback } from "react"
import { createPublicClient, http, formatUnits } from "viem"
import { MARKETS } from "../config/markets"

const ARC = {
  id:5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })

const MARKET_VIEW_ABI = [
  { name:"getPriceYes",     type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"resolutionTime",  type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"resolved",        type:"function", stateMutability:"view", inputs:[], outputs:[{type:"bool"}]    },
  { name:"oracle",          type:"function", stateMutability:"view", inputs:[], outputs:[{type:"address"}] },
  { name:"totalVolume",     type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"outcome",         type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint8"}]   },
]

export function useMarketData() {
  const [marketData, setMarketData] = useState({})
  const [loading,    setLoading]    = useState(true)

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(
      MARKETS.map(async m => {
        try {
          const [price, resTime, resolved, oracle, volume, outcome] = await Promise.all([
            pub.readContract({ address:m.address, abi:MARKET_VIEW_ABI, functionName:"getPriceYes" }),
            pub.readContract({ address:m.address, abi:MARKET_VIEW_ABI, functionName:"resolutionTime" }),
            pub.readContract({ address:m.address, abi:MARKET_VIEW_ABI, functionName:"resolved" }),
            pub.readContract({ address:m.address, abi:MARKET_VIEW_ABI, functionName:"oracle" }),
            pub.readContract({ address:m.address, abi:MARKET_VIEW_ABI, functionName:"totalVolume" }),
            pub.readContract({ address:m.address, abi:MARKET_VIEW_ABI, functionName:"outcome" }),
          ])
          return {
            address:        m.address,
            priceYes:       Number(price) / 1e18,
            resolutionTime: Number(resTime),
            resolved:       resolved,
            oracle:         oracle.toLowerCase(),
            totalVolume:    formatUnits(volume, 6),
            outcome:        Number(outcome), // 0=unresolved 1=yes 2=no 3=invalid
          }
        } catch {
          return { address:m.address, priceYes:m.priceYes, resolutionTime:0, resolved:false, oracle:"", totalVolume:"0", outcome:0 }
        }
      })
    )
    const map = {}
    results.forEach(r => { map[r.address] = r })
    setMarketData(map)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Refresh prices every 15s
  useEffect(() => {
    const t = setInterval(fetchAll, 15000)
    return () => clearInterval(t)
  }, [fetchAll])

  return { marketData, loading, refresh:fetchAll }
}

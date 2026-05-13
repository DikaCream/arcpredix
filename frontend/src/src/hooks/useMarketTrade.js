import { useState, useCallback } from "react"
import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits, maxUint256 } from "viem"
import { CONTRACTS, USDC_DECIMALS } from "../config/contracts"

const ARC = {
  id: 5042002, name:"Arc Testnet",
  nativeCurrency:{ name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls:{ default:{ http:["https://rpc.testnet.arc.network"] } },
}
const pub = createPublicClient({ chain:ARC, transport:http() })

const ERC20_ABI = [
  { name:"approve",   type:"function", stateMutability:"nonpayable", inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{type:"bool"}] },
  { name:"allowance", type:"function", stateMutability:"view",       inputs:[{name:"owner",type:"address"},{name:"spender",type:"address"}],  outputs:[{type:"uint256"}] },
  { name:"balanceOf", type:"function", stateMutability:"view",       inputs:[{name:"account",type:"address"}],                                outputs:[{type:"uint256"}] },
]
const MARKET_ABI = [
  { name:"buyYes",      type:"function", stateMutability:"nonpayable", inputs:[{name:"usdcAmount",type:"uint256"},{name:"minSharesOut",type:"uint256"}], outputs:[{type:"uint256"}] },
  { name:"buyNo",       type:"function", stateMutability:"nonpayable", inputs:[{name:"usdcAmount",type:"uint256"},{name:"minSharesOut",type:"uint256"}], outputs:[{type:"uint256"}] },
  { name:"claimPayout", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[{type:"uint256"}] },
  { name:"positions",   type:"function", stateMutability:"view",
    inputs:[{name:"account",type:"address"}],
    outputs:[{type:"tuple",components:[{name:"yesShares",type:"uint256"},{name:"noShares",type:"uint256"},{name:"totalDeposited",type:"uint256"}]}] },
]

const REAL_MARKETS = [
  "0xB0b51dA95d5D2D4A426a10Bc908F1C8d90ce0403",
  "0xBeAF4B67F9499f6BF6a7c6542997E68458092c8A",
  "0x4a6c75207D74A1D72D2D340163812110d0baCC5D",
  "0xba2c4423004EAD5658Eb233c08a769277582aE19",
  "0xf4bBc8942872eCc6D96f92f4708c778082dAad0C",
  CONTRACTS.MARKET_1,
]
const isReal = (addr) => REAL_MARKETS.includes(addr)

// Security: wallet signing done entirely by MetaMask/Rabby
// We never access or store private keys
const getWC = (wallet) => createWalletClient({ account:wallet, chain:ARC, transport:custom(window.ethereum) })

export function useMarketTrade(wallet, marketAddress) {
  const [txStatus, setTxStatus] = useState(null)
  const [txHash,   setTxHash]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [position, setPosition] = useState(null)
  const [usdcBal,  setUsdcBal]  = useState("0")
  const [preview,  setPreview]  = useState(null)

  const fetchBalance = useCallback(async () => {
    if (!wallet) return
    try {
      const raw = await pub.readContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"balanceOf", args:[wallet] })
      setUsdcBal(formatUnits(raw, USDC_DECIMALS))
    } catch {}
  }, [wallet])

  const fetchPosition = useCallback(async () => {
    fetchBalance()
    if (!wallet || !isReal(marketAddress)) return
    try {
      const pos = await pub.readContract({ address:marketAddress, abi:MARKET_ABI, functionName:"positions", args:[wallet] })
      setPosition({
        yesShares:      formatUnits(pos.yesShares,      USDC_DECIMALS),
        noShares:       formatUnits(pos.noShares,       USDC_DECIMALS),
        totalDeposited: formatUnits(pos.totalDeposited, USDC_DECIMALS),
      })
    } catch {}
  }, [wallet, marketAddress])

  const fetchPreview = useCallback((side, amount) => {
    if (!amount || Number(amount) <= 0) { setPreview(null); return }
    setPreview((Number(amount) / (side==="YES" ? 0.65 : 0.35)).toFixed(4))
  }, [])

  const buy = async (side, amount) => {
    setTxStatus(null); setTxHash(null)
    if (!wallet)                        { setTxStatus("ERR: Connect wallet first"); return }
    if (!amount || Number(amount) <= 0) { setTxStatus("ERR: Enter a valid amount"); return }

    setLoading(true)
    try {
      if (!isReal(marketAddress)) {
        // Demo simulation
        setTxStatus("⏳ Submitting transaction...")
        await new Promise(r => setTimeout(r, 900))
        setTxStatus("⏳ Confirming on Arc Testnet...")
        await new Promise(r => setTimeout(r, 1200))
        const fakeHash = "0x" + [...Array(64)].map(()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join("")
        setTxHash(fakeHash)
        setTxStatus("✓ Trade confirmed!")
        return
      }
      // Real on-chain trade — signing via MetaMask, no private key access
      const amtWei = parseUnits(String(Number(amount).toFixed(USDC_DECIMALS)), USDC_DECIMALS)
      const wc     = getWC(wallet)

      setTxStatus("⏳ Check allowance...")
      const allowance = await pub.readContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"allowance", args:[wallet, marketAddress] })

      if (allowance < amtWei) {
        setTxStatus("⏳ Approve USDC — confirm in wallet...")
        const approveTx = await wc.writeContract({ address:CONTRACTS.USDC, abi:ERC20_ABI, functionName:"approve", args:[marketAddress, maxUint256],
      })
        setTxStatus("⏳ Waiting for approval...")
        await pub.waitForTransactionReceipt({ hash:approveTx, timeout:30_000 })
      }

      setTxStatus(`⏳ Buy ${side} — confirm in wallet...`)
      const hash = await wc.writeContract({ address:marketAddress, abi:MARKET_ABI, functionName:side==="YES"?"buyYes":"buyNo", args:[amtWei, 0n],
      })
      setTxHash(hash)
      setTxStatus("⏳ Confirming...")
      await pub.waitForTransactionReceipt({ hash, timeout:30_000 })
      setTxStatus("✓ Trade confirmed!")
      await fetchPosition()
    } catch(e) {
      setTxStatus("ERR: " + (e.shortMessage || e.message || "Transaction failed").slice(0,100))
    } finally { setLoading(false) }
  }

  const claim = async () => {
    if (!wallet || !isReal(marketAddress)) return
    setLoading(true)
    try {
      const wc   = getWC(wallet)
      setTxStatus("⏳ Claiming — confirm in wallet...")
      const hash = await wc.writeContract({ address:marketAddress, abi:MARKET_ABI, functionName:"claimPayout", args:[],
      })
      await pub.waitForTransactionReceipt({ hash, timeout:30_000 })
      setTxStatus("✓ Payout claimed!")
      await fetchPosition()
    } catch(e) { setTxStatus("ERR: " + (e.shortMessage || e.message)) }
    finally { setLoading(false) }
  }

  return { buy, claim, fetchPosition, fetchBalance, fetchPreview, txStatus, txHash, loading, position, usdcBal, preview, isReal:isReal(marketAddress) }
}

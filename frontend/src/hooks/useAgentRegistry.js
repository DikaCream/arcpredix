import { useState, useEffect, useCallback } from "react"
import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits } from "viem"
import { CONTRACTS } from "../config/contracts"
import { REGISTRY_ABI, ERC20_ABI } from "../config/abis"

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name:"USDC", symbol:"USDC", decimals:18 },
  rpcUrls: { default:{ http:["https://rpc.testnet.arc.network"] } },
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
})

export function useAgentRegistry(wallet) {
  const [profile,     setProfile]     = useState(null)
  const [isActive,    setIsActive]    = useState(false)
  const [agentCount,  setAgentCount]  = useState(0)
  const [tier,        setTier]        = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [txStatus,    setTxStatus]    = useState(null)
  const [usdcBalance, setUsdcBalance] = useState("0")

  const TIER_NAMES  = ["None","Bronze","Silver","Gold","Platinum"]
  const TIER_COLORS = ["#94A3B8","#CD7F32","#94A3B8","#F59E0B","#06B6D4"]

  // Fetch profile + balance
  const fetchProfile = useCallback(async () => {
    if (!wallet) return
    try {
      const [prof, active, cnt, t, bal] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.REGISTRY, abi: REGISTRY_ABI,
          functionName: "getProfile", args: [wallet]
        }),
        publicClient.readContract({
          address: CONTRACTS.REGISTRY, abi: REGISTRY_ABI,
          functionName: "isActive", args: [wallet]
        }),
        publicClient.readContract({
          address: CONTRACTS.REGISTRY, abi: REGISTRY_ABI,
          functionName: "agentCount", args: []
        }),
        publicClient.readContract({
          address: CONTRACTS.REGISTRY, abi: REGISTRY_ABI,
          functionName: "getAgentTier", args: [wallet]
        }),
        publicClient.readContract({
          address: CONTRACTS.USDC, abi: ERC20_ABI,
          functionName: "balanceOf", args: [wallet]
        }),
      ])

      // profile.owner === zero address means not registered
      if (prof.owner !== "0x0000000000000000000000000000000000000000") {
        setProfile(prof)
        setIsActive(active)
        setTier(Number(t))
      }
      setAgentCount(Number(cnt))
      setUsdcBalance(formatUnits(bal, 6))
    } catch (e) {
      console.error("fetchProfile error:", e)
    }
  }, [wallet])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  // Register agent
  const register = async ({ name, metadataURI, stakeAmount }) => {
    if (!wallet) throw new Error("No wallet")
    setLoading(true)
    setTxStatus("Approving USDC...")

    try {
      const walletClient = createWalletClient({
        account: wallet,
        chain:   arcTestnet,
        transport: custom(window.ethereum),
      })

      const stakeWei = parseUnits(stakeAmount.toString(), 6)

      // 1. Approve USDC
      const approveTx = await walletClient.writeContract({
        address:      CONTRACTS.USDC,
        abi:          ERC20_ABI,
        functionName: "approve",
        args:         [CONTRACTS.REGISTRY, stakeWei],
      })
      setTxStatus("Waiting for approval confirmation...")
      await publicClient.waitForTransactionReceipt({ hash: approveTx })

      // 2. Register
      setTxStatus("Registering agent on Arc...")
      const registerTx = await walletClient.writeContract({
        address:      CONTRACTS.REGISTRY,
        abi:          REGISTRY_ABI,
        functionName: "register",
        args:         [name, metadataURI || "", stakeWei],
      })
      setTxStatus("Waiting for confirmation...")
      await publicClient.waitForTransactionReceipt({ hash: registerTx })

      setTxStatus("✓ Agent registered on Arc!")
      await fetchProfile()
      return registerTx
    } catch (e) {
      setTxStatus("Error: " + (e.shortMessage || e.message))
      throw e
    } finally {
      setLoading(false)
    }
  }

  return {
    profile, isActive, agentCount, tier, loading,
    txStatus, usdcBalance, register, fetchProfile,
    tierName:  TIER_NAMES[tier]  || "None",
    tierColor: TIER_COLORS[tier] || "#94A3B8",
  }
}

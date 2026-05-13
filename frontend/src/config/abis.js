export const REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name:"name",        type:"string"  },
      { name:"metadataURI", type:"string"  },
      { name:"stakeAmount", type:"uint256" },
    ],
    outputs: [],
  },
  {
    name: "getProfile",
    type: "function",
    stateMutability: "view",
    inputs: [{ name:"agent", type:"address" }],
    outputs: [{
      type:"tuple",
      components:[
        { name:"owner",               type:"address" },
        { name:"name",                type:"string"  },
        { name:"metadataURI",         type:"string"  },
        { name:"stake",               type:"uint256" },
        { name:"reputationScore",     type:"uint256" },
        { name:"jobsCompleted",       type:"uint256" },
        { name:"jobsFailed",          type:"uint256" },
        { name:"totalVolumeProvided", type:"uint256" },
        { name:"active",              type:"bool"    },
        { name:"registeredAt",        type:"uint256" },
        { name:"lastActivityAt",      type:"uint256" },
      ]
    }],
  },
  {
    name: "isActive",
    type: "function",
    stateMutability: "view",
    inputs: [{ name:"agent", type:"address" }],
    outputs: [{ type:"bool" }],
  },
  {
    name: "agentCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type:"uint256" }],
  },
  {
    name: "getAgentTier",
    type: "function",
    stateMutability: "view",
    inputs: [{ name:"agent", type:"address" }],
    outputs: [{ type:"uint8" }],
  },
  {
    name: "AgentRegistered",
    type: "event",
    inputs: [
      { name:"agent",     type:"address", indexed:true  },
      { name:"name",      type:"string",  indexed:false },
      { name:"stake",     type:"uint256", indexed:false },
      { name:"timestamp", type:"uint256", indexed:false },
    ],
  },
]

export const JOBBOARD_ABI = [
  {
    name: "postJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name:"market",            type:"address" },
      { name:"requiredLiquidity", type:"uint256" },
      { name:"durationSeconds",   type:"uint256" },
      { name:"payment",           type:"uint256" },
      { name:"minReputation",     type:"uint256" },
    ],
    outputs: [{ type:"uint256" }],
  },
  {
    name: "acceptJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name:"jobId", type:"uint256" }],
    outputs: [],
  },
  {
    name: "completeJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name:"jobId", type:"uint256" }],
    outputs: [],
  },
  {
    name: "getJob",
    type: "function",
    stateMutability: "view",
    inputs: [{ name:"jobId", type:"uint256" }],
    outputs: [{
      type:"tuple",
      components:[
        { name:"id",                type:"uint256"  },
        { name:"poster",            type:"address"  },
        { name:"market",            type:"address"  },
        { name:"requiredLiquidity", type:"uint256"  },
        { name:"durationSeconds",   type:"uint256"  },
        { name:"payment",           type:"uint256"  },
        { name:"minReputation",     type:"uint256"  },
        { name:"assignedAgent",     type:"address"  },
        { name:"status",            type:"uint8"    },
        { name:"postedAt",          type:"uint256"  },
        { name:"acceptedAt",        type:"uint256"  },
        { name:"completedAt",       type:"uint256"  },
      ]
    }],
  },
  {
    name: "jobCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type:"uint256" }],
  },
]

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name:"spender", type:"address" },
      { name:"amount",  type:"uint256" },
    ],
    outputs: [{ type:"bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name:"account", type:"address" }],
    outputs: [{ type:"uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name:"owner",   type:"address" },
      { name:"spender", type:"address" },
    ],
    outputs: [{ type:"uint256" }],
  },
]

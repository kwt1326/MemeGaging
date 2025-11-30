import { defineChain } from "viem";

export const insectarium = defineChain({
  id: 43522,
  name: 'Insectarium',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.insectarium.memecore.net'],
    }
  },
  blockExplorers: {
    default: {
      name: 'MemeCore Explorer',
      url: 'https://insectarium.blockscout.memecore.com',
      apiUrl: 'https://insectarium.blockscout.memecore.com/api',
    }
  },
})

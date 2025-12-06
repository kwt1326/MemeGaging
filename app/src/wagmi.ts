import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { insectarium } from './define'

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}

export const getConfig = () => createConfig({
  connectors: [
    injected(),
  ],
  chains: [insectarium],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [insectarium.id]: http(),
  },
})

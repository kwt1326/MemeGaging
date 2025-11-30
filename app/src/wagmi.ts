import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { insectarium } from './define'

export function getConfig() {
  return createConfig({
    chains: [insectarium],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [insectarium.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}

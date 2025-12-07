'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { getConfig } from '@/wagmi'
import { AutoInjectedConnect } from '@/components/wagmi/AutoInjectedConnect'
import { Header } from '@/components/Header'
import { CreatorProvider } from '@/contexts/CreatorContext'

export function Providers(props: {
  children: ReactNode
  initialState?: State
}) {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider
      config={config}
      reconnectOnMount={true}
      initialState={props.initialState}
    >
      <QueryClientProvider client={queryClient}>
        <CreatorProvider>
          <AutoInjectedConnect />
          <Header />
          {props.children}
        </CreatorProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

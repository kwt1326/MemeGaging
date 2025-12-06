'use client'

import { useCallback } from 'react'
import { useConnect, useConnectors, useConnection, useDisconnect } from 'wagmi'
import { walletConnect } from '@/lib/api'
import { Button } from '@/components/ui/button'

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnector() {
  const { address, status } = useConnection()
  const { disconnect } = useDisconnect()
  const { connect, isPending } = useConnect()
  const connectors = useConnectors()

  const isConnected = status === 'connected'

  const registerWallet = async (address: string) => {
    console.log(`register wallet address ${address}`)
    await walletConnect({ wallet_address: address });
  }

  const handleClick = useCallback(() => {
    if (isConnected) {
      // 이미 연결된 상태면 → 클릭 시 해제
      disconnect()
      return
    }

    // 아직 연결 안 된 상태면 → injected 커넥터로 연결 시도
    const injected = connectors.find((c) => c.id === 'injected') ?? connectors[0]
    if (!injected) {
      console.warn('No wallet connector available')
      return
    }

    connect({ connector: injected }, { onSuccess: (data) => registerWallet(data.accounts[0]) })
  }, [isConnected, disconnect, connect, connectors])

  let label = 'Connect Wallet'
  if (isConnected && address) {
    label = `${shortenAddress(address)} (Disconnect)`
  } else if (isPending) {
    label = 'Connecting...'
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending || connectors.length === 0}
      className="px-4"
    >
      {label}
    </Button>
  )
}

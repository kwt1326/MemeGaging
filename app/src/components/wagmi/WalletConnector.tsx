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

  const registerWallet = useCallback(async (address: string) => {
    try {
      console.log(`register wallet address ${address}`)
      await walletConnect({ wallet_address: address });
    } catch (error) {
      console.error('Failed to register wallet:', error)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (isConnected) {
      disconnect()
      return
    }

    const injected = connectors.find((c) => c.id === 'injected') ?? connectors[0]
    if (!injected) {
      console.warn('No wallet connector available')
      return
    }

    connect({ connector: injected }, { 
      onSuccess: (data) => {
        registerWallet(data.accounts[0])
      }
    })
  }, [isConnected, disconnect, connect, connectors, registerWallet])

  let label = 'Connect Wallet'
  if (isConnected && address) {
    label = `${shortenAddress(address)} (Disconnect)`
  } else if (isPending) {
    label = 'Connecting...'
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || connectors.length === 0}
      className={`px-4 py-2 rounded ${
        isConnected
          ? 'bg-gray-700 text-white'
          : 'bg-white text-gray-700 border border-gray-300'
      } ${(isPending || connectors.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  )
}

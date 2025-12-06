// hooks/useWalletConnection.ts
'use client'

import { useConnection } from 'wagmi'

export function useWalletConnection() {
  const { address, isConnected, status } = useConnection()

  return {
    address,
    isConnected,
    status, // 'connecting' | 'reconnecting' | 'connected' | 'disconnected'
  }
}
'use client'

import { useEffect, useRef } from 'react'
import { useConnect, useConnection, useConnectionEffect, useConnections } from 'wagmi'

export function AutoInjectedConnect() {
  const triedOnceRef = useRef(false)
  const connection = useConnection()
  const connectors = useConnections();
  const { connect } = useConnect()

  useConnectionEffect({
    onConnect(data) {
      console.log('Connected!', data)
    },
    onDisconnect() {
      console.log('Disconnected!')
    },
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (connection.status === 'disconnected') {
      triedOnceRef.current = false
    }

    if (triedOnceRef.current) return

    if (
      connection.status === 'connected' ||
      connection.status === 'connecting' ||
      connection.status === 'reconnecting'
    ) {
      triedOnceRef.current = true
      console.info(`[Connector] Already tried, status: ${connection.status}`)
      return
    }

    const injectedConnector = connectors.find(({ connector }) => connector.id === 'injected')

    if (!injectedConnector) {
      triedOnceRef.current = true
      return
    }

    connect({ connector: injectedConnector.connector })
    triedOnceRef.current = true
    console.info("[Connector] New connected")
  }, [connection.status, connectors, connect])

  return null
}

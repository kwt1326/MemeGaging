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

    // disconnect 상태일 때는 triedOnceRef 리셋 (재연결 가능하도록)
    if (connection.status === 'disconnected') {
      triedOnceRef.current = false
    }

    // 이미 한 번 시도했으면 또 호출 안 함 (무한 루프 방지)
    if (triedOnceRef.current) return

    // 이미 연결 중/연결 완료/재연결 중이면 아무 것도 안 함
    if (
      connection.status === 'connected' ||
      connection.status === 'connecting' ||
      connection.status === 'reconnecting'
    ) {
      triedOnceRef.current = true
      console.info(`[Connector] Already tried, status: ${connection.status}`)
      return
    }

    // 여기까지 왔으면 disconnected 상태
    // injected (브라우저 지갑) connector 찾기
    const injectedConnector = connectors.find(({ connector }) => connector.id === 'injected')

    if (!injectedConnector) {
      // MetaMask 같은 injected provider가 아예 없으면 그냥 패스
      triedOnceRef.current = true
      return
    }

    // 현재 활성화된 브라우저 지갑(대부분 MetaMask)으로 연결 시도
    // - 이미 권한 있으면: 바로 연결
    // - 처음이면: MetaMask 팝업 떠서 승인 요청
    connect({ connector: injectedConnector.connector })
    triedOnceRef.current = true
    console.info("[Connector] New connected")
  }, [connection.status, connectors, connect])

  return null
}

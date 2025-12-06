'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'

export default function HomePage() {
  const connection = useConnection()
  const { connect, status, error } = useConnect()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()

  return (
    <main className="p-8">
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">MemeGaging</h1>
        <div className="flex flex-col items-end gap-2">
          <h2 className="text-sm font-semibold">Connect</h2>
          <div className="flex gap-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
                size="sm"
              >
                {connector.name}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            <div>status: {status}</div>
            {error && <div className="text-red-500">{error.message}</div>}
          </div>
        </div>
      </div>

      <p className="mb-2">
        크리에이터 밈 파워 Mindshare 점수 & 온체인 Tip 대시보드
      </p>

      <nav className="mb-8 space-y-2">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <Link href="/creator" className="text-blue-500 hover:underline">
              /creator - 크리에이터 검색
            </Link>
          </li>
          <li>
            <Link
              href="/creator/1"
              className="text-blue-500 hover:underline"
            >
              /creator/[id] - 크리에이터 상세 (MemeScore, Tip, 그래프)
            </Link>
            <span className="text-xs text-muted-foreground ml-1">
              (예시: /creator/1)
            </span>
          </li>
          <li>
            <Link href="/ranking" className="text-blue-500 hover:underline">
              /ranking - 글로벌 랭킹
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              /dashboard - 내 대시보드
            </Link>
          </li>
        </ul>
      </nav>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Connection</h2>
        <div className="text-sm">
          status: {connection.status}
          <br />
          addresses: {JSON.stringify(connection.addresses)}
          <br />
          chainId: {connection.chainId}
        </div>
        {connection.status === 'connected' && (
          <Button
            type="button"
            onClick={() => disconnect()}
            className="mt-2"
            variant="outline"
          >
            Disconnect
          </Button>
        )}
      </section>
    </main>
  )
}

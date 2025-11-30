// 'use client'

// import { Button } from '@/components/ui/button'
// import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'

// function App() {
//   const connection = useConnection()
//   const { connect, status, error } = useConnect()
//   const connectors = useConnectors()
//   const { disconnect } = useDisconnect()

//   return (
//     <>
//       <div>
//         <h2>Connection</h2>

//         <div>
//           status: {connection.status}
//           <br />
//           addresses: {JSON.stringify(connection.addresses)}
//           <br />
//           chainId: {connection.chainId}
//         </div>

//         {connection.status === 'connected' && (
//           <Button type="button" onClick={() => disconnect()}>
//             Disconnect
//           </Button>
//         )}
//       </div>

//       <div>
//         <h2>Connect</h2>
//         {connectors.map((connector) => (
//           <Button
//             key={connector.uid}
//             onClick={() => connect({ connector })}
//             type="button"
//           >
//             {connector.name}
//           </Button>
//         ))}
//         <div>{status}</div>
//         <div>{error?.message}</div>
//       </div>
//     </>
//   )
// }

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">MemeGaging</h1>
      <p className="mb-2">크리에이터 밈 파워 Mindshare 점수 & 온체인 Tip 대시보드</p>
      <ul className="list-disc list-inside space-y-1">
        <li>/creator - 크리에이터 검색</li>
        <li>/creator/[handle] - 크리에이터 상세 (MemeScore, Tip, 그래프)</li>
        <li>/ranking - 글로벌 랭킹</li>
        <li>/dashboard - 내 대시보드</li>
      </ul>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">내 대시보드</h1>
      {/* TODO: 내 지갑 / MemeX 계정 기준으로
          - 내가 Tip한 크리에이터
          - 내가 기여한 점수
          를 backend /me/dashboard 에서 받아와 렌더링 */}
      <p>내가 Tip한 크리에이터와 내가 기여한 총 MemeScore를 보여줍니다.</p>
    </main>
  );
}
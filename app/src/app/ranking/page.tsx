export default function GlobalRankingPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">글로벌 랭킹</h1>
      {/* TODO: backend /creators/ranking API 호출해서 테이블로 표시 */}
      <p>최근 7일 MemeScore 기준 상위 크리에이터 랭킹을 보여줍니다.</p>
    </main>
  );
}
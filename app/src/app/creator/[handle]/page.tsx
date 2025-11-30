interface Props {
  params: { handle: string };
}

export default function CreatorDetailPage({ params }: Props) {
  const { handle } = params;
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">크리에이터 상세: {handle}</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">프로필 & MemeScore</h2>
        {/* TODO: 프로필, MemeScore, 그래프 */}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Tip</h2>
        {/* TODO: wagmi 사용해서 buyToken + tipWithToken 버튼 구현 */}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">최근 Tip 내역</h2>
        {/* TODO: backend /tips API 연동 */}
      </section>
    </main>
  );
}
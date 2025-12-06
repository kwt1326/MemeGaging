
type GlobalRankingViewProps = {
  creators: any[];
  loading: boolean;
  error: string | null;
};

export default function GlobalRankingView({
  creators,
  loading,
  error,
}: GlobalRankingViewProps) {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        글로벌 랭킹 (최근 7일 MemeScore)
      </h1>

      {loading && <p>로딩 중...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && creators.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          아직 랭킹 데이터가 없습니다.
        </p>
      )}

      {creators.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">순위</th>
              <th className="py-2 text-left">크리에이터</th>
              <th className="py-2 text-right">MemeScore</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((c: any, idx: number) => (
              <tr key={c.id} className="border-b hover:bg-muted/50">
                <td className="py-2">{idx + 1}</td>
                <td className="py-2">
                  <a
                    href={`/creator/${c.id}`}
                    className="hover:underline font-medium"
                  >
                    {c.display_name}
                  </a>
                  <span className="text-xs text-muted-foreground ml-1">
                    @{c.user_name}
                    {c.user_name_tag ? `#${c.user_name_tag}` : ""}
                  </span>
                </td>
                <td className="py-2 text-right font-mono">
                  {c.meme_score?.toFixed?.(2) ?? c.meme_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

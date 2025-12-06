import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DashboardViewProps = {
  creatorIdInput: string;
  onCreatorIdChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  data: any | null;
  onLoadDashboard: () => void;
};

export default function DashboardView({
  creatorIdInput,
  onCreatorIdChange,
  loading,
  error,
  data,
  onLoadDashboard,
}: DashboardViewProps) {
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">내 대시보드</h1>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">내 creator_id</h2>
        <div className="flex gap-2">
          <Input
            className="w-40"
            value={creatorIdInput}
            onChange={(e) => onCreatorIdChange(e.target.value)}
            placeholder="예: 1"
          />
          <Button onClick={onLoadDashboard} disabled={loading}>
            {loading ? "불러오는 중..." : "불러오기"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          (해커톤 버전에서는 편의상 creator_id 를 직접 입력합니다.)
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </section>

      {data && (
        <>
          <section className="border rounded-lg p-4 space-y-2">
            <h2 className="text-lg font-semibold">내 정보</h2>
            <p>
              {data.me.display_name}{" "}
              <span className="text-xs text-muted-foreground">
                @{data.me.user_name}
                {data.me.user_name_tag ? `#${data.me.user_name_tag}` : ""}
              </span>
            </p>
            <p className="text-sm">
              내가 기여한 총 Tip 수량:{" "}
              <span className="font-mono">
                {data.total_contributed_amount}
              </span>
            </p>
          </section>

          <section className="border rounded-lg p-4 space-y-2">
            <h2 className="text-lg font-semibold">내가 Tip한 크리에이터</h2>
            {data.tipped_creators.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Tip한 크리에이터가 아직 없습니다.
              </p>
            )}
            <ul className="space-y-1 text-sm">
              {data.tipped_creators.map((tc: any) => (
                <li
                  key={tc.to_creator_id}
                  className="flex justify-between border-b last:border-0 py-1"
                >
                  <div>
                    <a
                      href={`/creator/${tc.to_creator_id}`}
                      className="font-medium hover:underline"
                    >
                      {tc.creator?.display_name ?? "Unknown"}
                    </a>
                    <span className="text-xs text-muted-foreground ml-1">
                      @{tc.creator?.user_name}
                      {tc.creator?.user_name_tag
                        ? `#${tc.creator.user_name_tag}`
                        : ""}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    {tc.amount_total}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

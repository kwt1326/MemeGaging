import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletConnector } from "@/components/wagmi/WalletConnector";

type CreatorDetailViewProps = {
  loading: boolean;
  creator: any | null;
  stats: any | null;
  recentTips: any[];
  error: string | null;
  isConnected: boolean;
  walletAddress?: `0x${string}` | undefined;
  tokenAddress: `0x${string}` | null;
  onDisconnect: () => void;
  onTip: (amount: string) => void | Promise<void>;
  tipPending: boolean;
};

export default function CreatorDetailView({
  loading,
  creator,
  stats,
  recentTips,
  error,
  tokenAddress,
  onTip,
  tipPending,
}: CreatorDetailViewProps) {
  const [tipAmount, setTipAmount] = useState("0.1");

  if (loading && !creator) {
    return (
      <main className="p-8">
        <p>로딩 중...</p>
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="p-8">
        <p>크리에이터를 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{creator.display_name}</h1>
          <p className="text-sm text-muted-foreground">
            @{creator.user_name}
            {creator.user_name_tag ? `#${creator.user_name_tag}` : ""} ·{" "}
            <span className="font-mono text-xs">{creator.wallet_address}</span>
          </p>
          <p className="mt-2">
            MemeScore:{" "}
            <span className="font-semibold">
              {creator.meme_score?.toFixed?.(2) ?? creator.meme_score}
            </span>
          </p>
          {stats && (
            <p className="text-xs text-muted-foreground mt-1">
              최근 7일 Tip 횟수: {stats.tip_count_7d}, 총 Tip 수량:{" "}
              {stats.tip_amount_total_7d}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <WalletConnector />

          {tokenAddress && (
            <p className="text-[10px] text-muted-foreground max-w-xs text-right">
              Creator Token: <span className="font-mono">{tokenAddress}</span>
            </p>
          )}
        </div>
      </header>

      {/* Tip 섹션 */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Tip 보내기</h2>
        <div className="flex items-center gap-2">
          <Input
            className="w-32"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
          />
          <span className="text-sm text-muted-foreground">CREATOR 토큰</span>
          <Button
            onClick={() => onTip(tipAmount)}
            disabled={tipPending}
          >
            {tipPending ? "전송 중..." : "Tip 보내기"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip 전송 후, 이 페이지의 MemeScore와 Tip 내역이 자동으로 갱신됩니다.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </section>

      {/* 최근 Tip 내역 */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">최근 Tip 내역</h2>
        {recentTips.length === 0 && (
          <p className="text-sm text-muted-foreground">
            아직 Tip 내역이 없습니다.
          </p>
        )}
        <ul className="space-y-2 max-h-64 overflow-auto text-sm">
          {recentTips.map((t: any) => (
            <li
              key={t.id}
              className="flex justify-between border-b last:border-0 pb-1"
            >
              <div>
                <div>Amount: {t.amount}</div>
                <div className="text-[10px] text-muted-foreground">
                  tx: {t.tx_hash}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

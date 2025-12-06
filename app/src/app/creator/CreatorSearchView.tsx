import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CreatorSearchViewProps = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  creators: any[];
  loading: boolean;
  error: string | null;
};

export default function CreatorSearchView({
  query,
  onQueryChange,
  onSearch,
  creators,
  loading,
  error,
}: CreatorSearchViewProps) {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">크리에이터 검색</h1>

      <form onSubmit={onSearch} className="flex gap-2">
        <Input
          placeholder="user_name 또는 display_name 검색"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-2">
        {creators.map((c) => (
          <Link
            key={c.id}
            href={`/creator/${c.id}`}
            className="block border rounded-md p-3 hover:bg-muted transition"
          >
            <div className="font-semibold">
              {c.display_name}{" "}
              <span className="text-xs text-muted-foreground">
                @{c.user_name}
                {c.user_name_tag ? `#${c.user_name_tag}` : ""}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              MemeScore: {c.meme_score?.toFixed?.(2) ?? c.meme_score}
            </div>
          </Link>
        ))}
        {!loading && creators.length === 0 && (
          <p className="text-sm text-muted-foreground">
            검색 결과가 없습니다. 키워드를 입력해보세요.
          </p>
        )}
      </div>
    </main>
  );
}

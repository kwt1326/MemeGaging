const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function searchCreators(q: string) {
  const res = await fetch(`${API_BASE}/creators/search?q=${encodeURIComponent(q)}`);
  return handle<{ creators: any[] }>(res);
}

export async function fetchCreatorDetail(id: string | number) {
  const res = await fetch(`${API_BASE}/creators/${id}`);
  return handle<{
    creator: Creator;
    user: UserProfile
    stats: { tip_count_7d: number; tip_amount_total_7d: string };
    score_breakdown: {
      engagementScore: number;
      viewScore: number;
      followScore: number;
      tipScore: number;
      memeScore: number;
    };
    recent_tips: RecentTips;
  }>(res);
}

export async function fetchCreatorDetailByAddress(address: string | undefined) {
  const res = await fetch(`${API_BASE}/creators/from-address/${address}`);
  return handle<{ ok: boolean; creator: Creator; user: UserProfile; }>(res);
}

export async function fetchRanking(limit = 20, search = "") {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const res = await fetch(
    `${API_BASE}/creators/ranking/top?limit=${limit}${searchParam}`,
    { cache: 'no-store' }
  );
  return handle<{ creators: Creators }>(res);
}


export async function fetchCreatorScores(creatorId: number, limit = 10) {
  const res = await fetch(
    `${API_BASE}/scores/creator/${creatorId}?limit=${limit}`,
    { cache: 'no-store' }
  );
  return handle<{ scores: ScoreRecord[] }>(res);
}

export async function fetchDashboard(address: `0x${string}` | undefined) {
  const res = await fetch(`${API_BASE}/dashboard/${address}`);
  return handle<DashboardData>(res);
}

export async function walletConnect(payload: {
  wallet_address: string;
}) {
  const res = await fetch(`${API_BASE}/wallet/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<{ ok: boolean; }>(res);
}

export async function notifyTip(payload: {
  to_creator_id: number;
  from_creator_id: number;
  token_address: string;
  amount: string;
  tx_hash: string;
}) {
  const res = await fetch(`${API_BASE}/tips/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

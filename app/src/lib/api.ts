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
    creator: any;
    stats: { tip_count_7d: number; tip_amount_total_7d: string };
    recent_tips: any[];
  }>(res);
}

export async function fetchCreatorDetailByAddress(address: string | undefined) {
  const res = await fetch(`${API_BASE}/creators/from-address/${address}`);
  return handle<{ ok: boolean; creator_id: number; token_address: string }>(res);
}

export async function fetchRanking(limit = 100) {
  const res = await fetch(
    `${API_BASE}/creators/ranking/top?limit=${limit}`,
    { next: { revalidate: 10 } }
  );
  return handle<{ creators: Creators }>(res);
}

export async function fetchDashboard(creatorId: number) {
  const res = await fetch(`${API_BASE}/dashboard/${creatorId}`);
  return handle<{
    me: any;
    total_contributed_amount: string;
    tipped_creators: {
      to_creator_id: number;
      amount_total: string;
      creator: any;
    }[];
  }>(res);
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

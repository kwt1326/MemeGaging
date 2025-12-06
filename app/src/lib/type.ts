interface Creator {
  id: number;
  memex_user_id: number;
  user_name: string;
  display_name: string;
  user_name_tag: string;
  wallet_address: `0x${string}`; // 이더리움 지갑 주소 형태
  access_token: string; // JWT 토큰
  meme_score: number;
  created_at: string; // ISO 8601 날짜 형식
  updated_at: string; // ISO 8601 날짜 형식
}

type Creators = Creator[];

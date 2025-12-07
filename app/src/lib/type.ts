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
  score?: ScoreRecord | null; // ranking/top API에서 포함됨
}

type Creators = Creator[];

interface CreatorStat { 
  tip_count_7d: number; 
  tip_amount_total_7d: string;
  score_breakdown?: {
    engagementScore: number;
    viewScore: number;
    followScore: number;
    tipScore: number;
    memeScore: number;
  };
}

interface RecentTip {
    id: number;
    created_at: Date;
    from_creator_id: number | null;
    to_creator_id: number;
    token_address: string;
    amount: string;
    tx_hash: string;
}

type RecentTips = RecentTip[]

interface UserProfile {
  userType: "GENERAL" | string; // 다른 타입이 있을 수 있으므로
  bannerImageUrl: string | null;
  profileImageUrl: string;
  displayName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenImageUrl: string;
  tokenCexListed: boolean;
  userName: string;
  userNameTag: string;
  bio: string | null;
  totalDonationAmount: number | null;
  location: string | null;
  website: string | null;
  minted: string; // 날짜 문자열
  bondingCurve: BondingCurve;
  following: number;
  followers: number;
  hold: number;
  sponsor: number;
  refCode: string | null;
  isFollow: boolean | null;
  isPreOrdered: boolean;
  metaData: MetaData;
}

interface BondingCurve {
  bodingCurveTotal: string; // 숫자가 문자열로 저장됨
  bondingCurveGoal: string;
  bondingCurveProgress: number;
  progress: number;
  currentPrice: string; // 정밀한 소수점이 문자열로 저장됨
  tokenImageUrl: string;
}

interface MetaData {
  countryCode: string;
  countryName: string;
  continentName: string;
  countryRecordedAt: string; // ISO 8601 날짜 형식
}

interface ScoreRecord {
  id: number;
  creator_id: number;
  engagement_score: number;
  view_score: number;
  follow_score: number;
  tip_score: number;
  meme_score: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  views: number;
  followers: number;
  tip_count: number;
  tip_amount: string;
  created_at: string;
  creator?: {
    id: number;
    user_name: string;
    display_name: string;
    wallet_address: string;
  };
}

interface TippedCreator {
  to_creator_id: number;
  creator: Creator;
  amount_total: string;
  tip_count: number;
}

interface DashboardData {
  me: Creator;
  my_score: ScoreRecord | null;
  tipped_creators: TippedCreator[];
  total_contributed_amount: string;
  total_tip_count: number;
  unique_creators_count: number;
  ai_analysis?: {
    analysis: string;
    score_breakdown: {
      like_points: number;
      comment_points: number;
      repost_points: number;
      quote_points: number;
      view_points: number;
      follow_points: number;
      tip_points: number;
      like_label: string;
      comment_label: string;
      repost_label: string;
      quote_label: string;
      view_label: string;
      follower_label: string;
      tip_label: string;
    };
    bot_score: number;
  } | null;
}

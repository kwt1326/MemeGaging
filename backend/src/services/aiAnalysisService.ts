import { analyzeCreatorStats, type AIAnalysisRequest } from "../clients/aiBackendClient";
import { weiToEth } from "../utils/conversion";

export type AIAnalysisResult = {
  analysis: string;
  score_breakdown: {
    engagement_quality: number;
    virality_potential: number;
    community_strength: number;
    monetization_health: number;
  };
  bot_score: number;
};

export type CreatorStatsInput = {
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  views: number;
  followers: number;
  tip_count: number;
  tip_amount: string; // Wei 단위
};

/**
 * AI Backend에 크리에이터 통계를 분석 요청
 * 비동기로 호출되며, 실패해도 null을 반환하여 메인 응답에 영향을 주지 않음
 */
export async function analyzeCreatorStatsAsync(
  stats: CreatorStatsInput
): Promise<AIAnalysisResult | null> {
  try {
    const tipAmountInEth = weiToEth(stats.tip_amount);
    
    const request: AIAnalysisRequest = {
      likes: stats.likes,
      comments: stats.replies,
      reposts: stats.reposts,
      quotes: stats.quotes,
      views: stats.views,
      followers: stats.followers,
      tip_count: stats.tip_count,
      tip_amount: tipAmountInEth,
    };

    const response = await analyzeCreatorStats(request);

    if (response.success && response.analysis && response.score_breakdown && response.bot_score !== undefined) {
      return {
        analysis: response.analysis,
        score_breakdown: response.score_breakdown,
        bot_score: response.bot_score,
      };
    }

    return null;
  } catch (error) {
    console.warn(
      "AI Backend 호출 실패 (무시하고 계속):",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

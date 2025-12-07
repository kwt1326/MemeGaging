import axios from "axios";

import { AI_BACKEND_URL } from "../config";

const base = axios.create({
  baseURL: AI_BACKEND_URL,
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
  timeout: 20000, // 20초 타임아웃
});

export type AIAnalysisRequest = {
  likes: number;
  comments: number;
  reposts: number;
  quotes: number;
  views: number;
  followers: number;
  tip_count: number;
  tip_amount: number; // ETH 단위
};

export type AIAnalysisResponse = {
  success: boolean;
  analysis?: string;
  score_breakdown?: {
    engagement_quality: number;
    virality_potential: number;
    community_strength: number;
    monetization_health: number;
  };
  bot_score?: number;
};

export async function analyzeCreatorStats(
  stats: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  const res = await base.post<AIAnalysisResponse>("/analyze", stats);
  return res.data;
}

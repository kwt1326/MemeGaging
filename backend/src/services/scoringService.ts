import { prisma } from "../prisma";
import { weiToEth } from "../utils/conversion";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type Stats7d = {
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  views: number;
  followers: number;
  tipCount: number;
  tipAmount: string;
};

type ScoreBreakdown = {
  engagementScore: number;
  viewScore: number;
  followScore: number;
  tipScore: number;
  memeScore: number;
};

function calcMemeScoreV2(stats: Stats7d): ScoreBreakdown {
  const { likes, replies, reposts, quotes, views, followers, tipCount, tipAmount } = stats;

  const totalEngagement = likes + replies + reposts + quotes;
  const engagementScore = Math.log10(1 + totalEngagement) * 10;

  const viewScore = Math.log10(1 + views) * 5;

  const followScore = Math.log10(1 + followers) * 8;

  const tipAmountEther = weiToEth(tipAmount);
  const tipScore = Math.log10(1 + tipCount) * 3 + Math.log10(1 + tipAmountEther) * 2;

  const memeScore = engagementScore + viewScore + followScore + tipScore;

  return {
    engagementScore: Math.round(engagementScore * 10) / 10,
    viewScore: Math.round(viewScore * 10) / 10,
    followScore: Math.round(followScore * 10) / 10,
    tipScore: Math.round(tipScore * 10) / 10,
    memeScore: Math.round(memeScore * 10) / 10,
  };
}

export async function computeStatsForCreator(creatorId: number): Promise<Stats7d> {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) throw new Error("creator_not_found");

  const now = Date.now();
  const since = now - SEVEN_DAYS_MS;

  const latestScore = await prisma.score.findFirst({
    where: { creator_id: creatorId },
    orderBy: { created_at: 'desc' },
  });

  let likes = latestScore?.likes || 0;
  let replies = latestScore?.replies || 0;
  let reposts = latestScore?.reposts || 0;
  let quotes = latestScore?.quotes || 0;
  let views = latestScore?.views || 0;
  let followers = latestScore?.followers || 0;

  const tips = await prisma.tip.findMany({
    where: {
      to_creator_id: creatorId,
      created_at: {
        gte: new Date(since),
      },
    },
  });

  const tipCount = tips.length;
  const tipAmount = tips.reduce((sum, tip) => sum + BigInt(tip.amount.toString()), BigInt(0)).toString();

  return { likes, replies, reposts, quotes, views, followers, tipCount, tipAmount };
}

export async function recomputeMemeScoreForCreator(creatorId: number) {
  const stats = await computeStatsForCreator(creatorId);
  const scoreBreakdown = calcMemeScoreV2(stats);

  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      meme_score: scoreBreakdown.memeScore,
    },
  });

  await prisma.score.create({
    data: {
      creator_id: creatorId,
      engagement_score: scoreBreakdown.engagementScore,
      view_score: scoreBreakdown.viewScore,
      follow_score: scoreBreakdown.followScore,
      tip_score: scoreBreakdown.tipScore,
      meme_score: scoreBreakdown.memeScore,
      likes: stats.likes,
      replies: stats.replies,
      reposts: stats.reposts,
      quotes: stats.quotes,
      views: stats.views,
      followers: stats.followers,
      tip_count: stats.tipCount,
      tip_amount: stats.tipAmount,
    },
  });

  return { stats, ...scoreBreakdown };
}

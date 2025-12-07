import { Router } from "express";
import { prisma } from "../prisma";
import { fetchMyInfo } from "../clients/memexClient";
import { analyzeCreatorStatsAsync } from "../services/aiAnalysisService";

export const creatorRouter = Router();

creatorRouter.get("/from-address/:address", async (req, res) => {
  try {
    const address = String(req.params.address);
    if (!address) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const creator = await prisma.creator.findFirst({
      where: {
        wallet_address: {
          equals: address,
          mode: "insensitive",
        },
      },
    });

    if (!creator) {
      return res.status(404).json({ error: "not_found" });
    }

    const user = await fetchMyInfo(creator.access_token);
    const tokenAddress: string | undefined = user.tokenAddress;

    if (!tokenAddress) {
      console.error("MemeX user info has no tokenAddress", user);
      return res.status(500).json({ error: "no_token_address_from_memex" });
    }

    res.json({
      ok: true,
      creator,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

creatorRouter.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({ creators: [] });
    }

    const creators = await prisma.creator.findMany({
      where: {
        OR: [
          { user_name: { contains: q, mode: "insensitive" } },
          { display_name: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { meme_score: "desc" },
      take: 20,
    });

    res.json({ creators });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

creatorRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const creator = await prisma.creator.findUnique({
      where: { id },
    });

    if (!creator) {
      return res.status(404).json({ error: "not_found" });
    }

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const tips = await prisma.tip.findMany({
      where: {
        to_creator_id: id,
        created_at: { gte: since },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const totalAmount = tips.reduce((acc, tip) => {
      const v = BigInt(tip.amount.toString());
      return acc + v;
    }, 0n);

    const user = await fetchMyInfo(creator.access_token);

    let scoreBreakdown;
    let aiAnalysis = null;
    
    try {
      const latestScore = await prisma.score.findFirst({
        where: { creator_id: id },
        orderBy: { created_at: "desc" },
      });

      if (latestScore) {
        scoreBreakdown = {
          engagementScore: latestScore.engagement_score,
          viewScore: latestScore.view_score,
          followScore: latestScore.follow_score,
          tipScore: latestScore.tip_score,
          memeScore: latestScore.meme_score,
        };
        
        aiAnalysis = await analyzeCreatorStatsAsync({
          likes: latestScore.likes,
          replies: latestScore.replies,
          reposts: latestScore.reposts,
          quotes: latestScore.quotes,
          views: latestScore.views,
          followers: latestScore.followers,
          tip_count: latestScore.tip_count,
          tip_amount: totalAmount.toString(),
        });
      } else {
        scoreBreakdown = null;
      }
    } catch (err) {
      console.error("Error fetching score breakdown:", err);
      scoreBreakdown = null;
    }

    res.json({
      creator,
      user,
      stats: {
        tip_count_7d: tips.length,
        tip_amount_total_7d: totalAmount.toString(),
      },
      score_breakdown: scoreBreakdown,
      ai_analysis: aiAnalysis,
      recent_tips: tips,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

creatorRouter.get("/ranking/top", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const safeLimit = Number.isNaN(limit) ? 100 : Math.min(limit, 3000);
    const search = req.query.search ? String(req.query.search).trim() : "";

    const whereClause = search
      ? {
          display_name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const creators = await prisma.creator.findMany({
      where: whereClause,
      orderBy: { meme_score: "desc" },
      take: safeLimit,
      include: {
        scores: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
    });

    const formattedCreators = creators.map((creator) => ({
      ...creator,
      score: creator.scores[0] || null,
      scores: undefined,
    }));

    res.json({ creators: formattedCreators });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

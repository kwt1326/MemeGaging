import { Router } from "express";
import { prisma } from "../prisma";
import { fetchMyInfo } from "../clients/memexClient";

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


/**
 * GET /creators/search?q=...
 * - 크리에이터 검색 (user_name, display_name 기준)
 */
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

/**
 * GET /creators/:id
 * - 크리에이터 상세 정보 + 간단한 tip 통계 + 점수 breakdown
 */
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

    // 최근 Tip 수량/금액 통계 (예시: 최근 7일)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const tips = await prisma.tip.findMany({
      where: {
        to_creator_id: id,
        created_at: { gte: since },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    // 총 amount 합산 (Decimal -> string)
    const totalAmount = tips.reduce((acc, tip) => {
      // Decimal to string
      const v = BigInt(tip.amount.toString());
      return acc + v;
    }, 0n);

    const user = await fetchMyInfo(creator.access_token);

    // 점수 breakdown - 최신 score 레코드에서 가져오기
    let scoreBreakdown;
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
        tip_amount_total_7d: totalAmount.toString(), // wei 등의 단위 string
      },
      score_breakdown: scoreBreakdown,
      recent_tips: tips,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * GET /creators/ranking/top?limit=100&search=keyword
 * - MemeScore 기준 글로벌 랭킹 (score 정보 포함)
 * - search 파라미터가 있으면 display_name으로 필터링
 */
creatorRouter.get("/ranking/top", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const safeLimit = Number.isNaN(limit) ? 100 : Math.min(limit, 3000);
    const search = req.query.search ? String(req.query.search).trim() : "";

    // 검색 조건 구성
    const whereClause = search
      ? {
          display_name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    // creator와 최신 score를 함께 가져오기
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

    // 응답 데이터 포맷팅 - score를 평탄화
    const formattedCreators = creators.map((creator) => ({
      ...creator,
      score: creator.scores[0] || null,
      scores: undefined, // scores 배열은 제거
    }));

    res.json({ creators: formattedCreators });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

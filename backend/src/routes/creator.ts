import { Router } from "express";
import { prisma } from "../prisma";

export const creatorRouter = Router();

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
 * - 크리에이터 상세 정보 + 간단한 tip 통계
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

    res.json({
      creator,
      stats: {
        tip_count_7d: tips.length,
        tip_amount_total_7d: totalAmount.toString(), // wei 등의 단위 string
      },
      recent_tips: tips,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * GET /creators/ranking?limit=100
 * - MemeScore 기준 글로벌 랭킹
 */
creatorRouter.get("/ranking/top", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const safeLimit = Number.isNaN(limit) ? 100 : Math.min(limit, 3000);

    const creators = await prisma.creator.findMany({
      orderBy: { meme_score: "desc" },
      take: safeLimit,
    });

    res.json({ creators });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

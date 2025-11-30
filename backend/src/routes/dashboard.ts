import { Router } from "express";
import { prisma } from "../prisma";

export const dashboardRouter = Router();

/**
 * GET /dashboard/:creator_id
 * - 내가 Tip한 크리에이터 + 내가 기여한 총 amount
 * - creator_id 는 우리 DB creator.id 기준
 */
dashboardRouter.get("/:creator_id", async (req, res) => {
  try {
    const creatorId = Number(req.params.creator_id);
    if (Number.isNaN(creatorId)) {
      return res.status(400).json({ error: "invalid_creator_id" });
    }

    const me = await prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!me) {
      return res.status(404).json({ error: "creator_not_found" });
    }

    // 내가 Tip한 내역 그룹화
    const grouped = await prisma.tip.groupBy({
      by: ["to_creator_id"],
      where: { from_creator_id: creatorId },
      _sum: { amount: true },
    });

    const toIds = grouped.map((g) => g.to_creator_id);

    const creators = await prisma.creator.findMany({
      where: { id: { in: toIds } },
    });

    const creatorById = new Map(creators.map((c) => [c.id, c]));

    // 총 기여 amount
    const totalContributed = grouped.reduce((acc, g) => {
      const val = g._sum.amount;
      if (!val) return acc;
      return acc + BigInt(val.toString());
    }, 0n);

    const tippedCreators = grouped.map((g) => {
      const val = g._sum.amount;
      const creator = creatorById.get(g.to_creator_id);
      return {
        to_creator_id: g.to_creator_id,
        amount_total: val ? val.toString() : "0",
        creator,
      };
    });

    res.json({
      me,
      total_contributed_amount: totalContributed.toString(),
      tipped_creators: tippedCreators,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

import { Router } from "express";
import { prisma } from "../prisma";

export const dashboardRouter = Router();

dashboardRouter.get("/:address", async (req, res) => {
  try {
    const address = String(req.params.address);
    
    const me = await prisma.creator.findFirst({
      where: {
        wallet_address: {
          equals: address,
          mode: "insensitive",
        },
      },
    });

    if (!me) {
      return res.status(404).json({ error: "creator_not_found" });
    }

    const myScore = await prisma.score.findFirst({
      where: { creator_id: me.id },
      orderBy: { created_at: "desc" },
    });

    const tipsSent = await prisma.tip.findMany({
      where: { from_creator_id: me.id },
      orderBy: { created_at: "desc" },
      include: {
        to_creator: {
          include: {
            scores: {
              orderBy: { created_at: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const tippedCreatorsMap = new Map<number, {
      to_creator_id: number;
      creator: any;
      amount_total: string;
      tip_count: number;
    }>();

    let totalContributed = 0n;

    for (const tip of tipsSent) {
      const creatorId = tip.to_creator_id;
      const amount = BigInt(tip.amount.toString());
      totalContributed += amount;

      if (tippedCreatorsMap.has(creatorId)) {
        const existing = tippedCreatorsMap.get(creatorId)!;
        existing.amount_total = (BigInt(existing.amount_total) + amount).toString();
        existing.tip_count += 1;
      } else {
        const creator = tip.to_creator;
        const creatorWithScore = {
          ...creator,
          meme_score: creator.scores[0]?.meme_score || creator.meme_score,
          scores: undefined,
        };
        
        tippedCreatorsMap.set(creatorId, {
          to_creator_id: creatorId,
          creator: creatorWithScore,
          amount_total: amount.toString(),
          tip_count: 1,
        });
      }
    }

    const tippedCreators = Array.from(tippedCreatorsMap.values())
      .sort((a, b) => {
        const diff = BigInt(b.amount_total) - BigInt(a.amount_total);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });

    res.json({
      me: {
        ...me,
        meme_score: myScore?.meme_score || me.meme_score,
      },
      my_score: myScore || null,
      tipped_creators: tippedCreators,
      total_contributed_amount: totalContributed.toString(),
      total_tip_count: tipsSent.length,
      unique_creators_count: tippedCreators.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

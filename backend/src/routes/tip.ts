import { Router } from "express";
import { prisma } from "../prisma";
import { recomputeMemeScoreForCreator } from "../services/scoringService";

export const tipRouter = Router();

tipRouter.post("/notify", async (req, res) => {
  try {
    const {
      to_creator_id,
      from_creator_id,
      token_address,
      amount,
      tx_hash,
    } = req.body as {
      to_creator_id: number;
      from_creator_id: number;
      token_address: string;
      amount: string;
      tx_hash: string;
    };

    if (!to_creator_id || !token_address || !amount || !tx_hash) {
      return res.status(400).json({ error: "invalid_body" });
    }

    const tip = await prisma.tip.create({
      data: {
        to_creator_id,
        from_creator_id,
        token_address,
        amount,
        tx_hash,
      },
    });

    const result = await recomputeMemeScoreForCreator(to_creator_id);

    res.json({
      ok: true,
      tip,
      meme_score: result.memeScore,
      stats: result.stats,
    });
  } catch (err: any) {
    console.error(err);
    if (
      typeof err.message === "string" &&
      err.message.includes("Unique constraint failed on the fields: (`tx_hash`)")
    ) {
      return res.status(409).json({ error: "tip_already_recorded" });
    }
    res.status(500).json({ error: "internal_error" });
  }
});

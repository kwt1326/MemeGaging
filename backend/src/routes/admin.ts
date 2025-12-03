import { Router } from "express";
import { recomputeAllCreatorsMemeScore, recomputeMemeScoreForCreator } from "../services/scoringService";

export const adminRouter = Router();

/**
 * POST /admin/recompute/all
 * - 전체 크리에이터 MemeScore 재계산 (해커톤용, 나중에 cron 으로 대체)
 */
adminRouter.post("/recompute/all", async (_req, res) => {
  try {
    await recomputeAllCreatorsMemeScore();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /admin/recompute/:creator_id
 * - 특정 크리에이터만 재계산
 */
adminRouter.post("/recompute/:creator_id", async (req, res) => {
  try {
    const creatorId = Number(req.params.creator_id);
    if (Number.isNaN(creatorId)) {
      return res.status(400).json({ error: "invalid_creator_id" });
    }

    const result = await recomputeMemeScoreForCreator(creatorId);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

import { Router } from "express";
import { prisma } from "../prisma";

export const scoreRouter = Router();

scoreRouter.get("/creator/:creatorId", async (req, res) => {
  try {
    const creatorId = Number(req.params.creatorId);
    if (Number.isNaN(creatorId)) {
      return res.status(400).json({ error: "invalid_creator_id" });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const safeLimit = Number.isNaN(limit) ? 50 : Math.min(limit, 1000);

    const scores = await prisma.score.findMany({
      where: { creator_id: creatorId },
      orderBy: { created_at: "desc" },
      take: safeLimit,
    });

    res.json({ scores });
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

scoreRouter.delete("/clear", async (req, res) => {
  try {
    const result = await prisma.score.deleteMany({});
    
    res.json({
      ok: true,
      message: `Deleted ${result.count} score records`,
      count: result.count,
    });
  } catch (err) {
    console.error("Error clearing scores:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

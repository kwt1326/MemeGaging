import { Router } from "express";
import { prisma } from "../prisma";
import { recomputeMemeScoreForCreator } from "../services/scoringService";

export const tipRouter = Router();

/**
 * POST /tips/notify
 * body: {
 *   to_creator_id: number;           // 팁 받은 쪽 creator.id
 *   from_creator_id?: number;        // (옵션) 팁 보낸 쪽 creator.id (있으면)
 *   token_address: string;           // 사용된 크리에이터 토큰 주소
 *   amount: string;                  // on-chain amount (wei 등, string)
 *   tx_hash: string;                 // 트랜잭션 해시
 * }
 *
 * - 용도:
 *   1) tip 테이블에 기록
 *   2) MemeScore 재계산 1회 수행
 */
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
      from_creator_id?: number;
      token_address: string;
      amount: string;
      tx_hash: string;
    };

    if (!to_creator_id || !token_address || !amount || !tx_hash) {
      return res.status(400).json({ error: "invalid_body" });
    }

    // 1. Tip 기록 저장 (중복 방지를 위해 tx_hash unique)
    const tip = await prisma.tip.create({
      data: {
        to_creator_id,
        from_creator_id: from_creator_id ?? null,
        token_address,
        amount,
        tx_hash,
      },
    });

    // 2. 점수 재계산 (팁 받은 크리에이터 기준)
    const result = await recomputeMemeScoreForCreator(to_creator_id);

    res.json({
      ok: true,
      tip,
      meme_score: result.memeScore,
      stats: result.stats,
    });
  } catch (err: any) {
    // tx_hash unique constraint라면, 이미 기록한 팁일 수 있음
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

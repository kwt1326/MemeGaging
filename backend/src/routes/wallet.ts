import { Router } from "express";
import { prisma } from "../prisma";
import { allowTokenIfNeeded } from "../clients/onchainClient";
import { fetchMyInfo } from "../clients/memexClient";

export const walletRouter = Router();

/**
 * POST /wallet/connect
 * body: {
 *   creator_id: number;
 *   wallet_address: string;
 * }
 *
 * - 지갑이 연결될 때마다:
 *   1) DB 에서 해당 creator 의 access_token 조회
 *   2) MemeX /public/v1/user 호출 → tokenAddress 가져옴
 *   3) MemeTipLoggerV2.allowedTokens(tokenAddress) 확인 후, 없으면 setAllowedToken
 */
walletRouter.post("/connect", async (req, res) => {
  try {
    const { creator_id, wallet_address } = req.body as {
      creator_id: number;
      wallet_address: string;
    };

    if (!creator_id) {
      return res.status(400).json({ error: "invalid_creator_id" });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: creator_id },
    });

    if (!creator) {
      return res.status(404).json({ error: "creator_not_found" });
    }

    // (옵션) DB에 저장된 wallet_address와 연동된 지갑이 맞는지 검증
    if (
      wallet_address &&
      creator.wallet_address.toLowerCase() !== wallet_address.toLowerCase()
    ) {
      console.warn("wallet mismatch", {
        db: creator.wallet_address,
        input: wallet_address,
      });
      // 해커톤이면 그냥 경고만; 진짜 프로덕션이면 여기서 막는 것도 고려
    }

    // 1. MemeX /public/v1/user 호출해서 tokenAddress 가져오기
    const myInfo = await fetchMyInfo(creator.access_token);

    const tokenAddress: string | undefined = myInfo.tokenAddress;
    if (!tokenAddress) {
      console.error("MemeX user info has no tokenAddress", myInfo);
      return res.status(500).json({ error: "no_token_address_from_memex" });
    }

    // 2. 온체인 Logger 화이트리스트 확인 + 필요시 setAllowedToken
    await allowTokenIfNeeded(tokenAddress as `0x${string}`);

    // DB에는 tokenAddress 저장 안함
    res.json({
      ok: true,
      creator,
      token_address: tokenAddress, // 프론트에서 바로 써도 좋음
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

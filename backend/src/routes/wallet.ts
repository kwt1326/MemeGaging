import { Router } from "express";
import { prisma } from "../prisma";
import { allowTokenIfNeeded } from "../clients/onchainClient";
import { fetchMyInfo } from "../clients/memexClient";

export const walletRouter = Router();

/**
 * POST /wallet/connect
 * body: {
 *   wallet_address: string;
 * }
 *
 * - 지갑이 연결될 때마다:
 *   1) DB 에서 wallet_address 로 creator 조회
 *   2) 해당 creator 의 access_token 으로 MemeX /public/v1/user 호출 → tokenAddress 가져옴
 *   3) MemeTipLoggerV2.allowedTokens(tokenAddress) 확인 후, 없으면 setAllowedToken
 */
walletRouter.post("/connect", async (req, res) => {
  try {
    const { wallet_address } = req.body as {
      wallet_address: string;
    };

    if (!wallet_address) {
      console.error("invalid_wallet_address")
      return res.status(400).json({ error: "invalid_wallet_address" });
    }

    // 1. wallet_address 로 creator 찾기 (대소문자 무시)
    const creator = await prisma.creator.findFirst({
      where: {
        wallet_address: {
          equals: wallet_address,
          mode: "insensitive",
        },
      },
    });

    if (!creator) {
      console.error("creator_not_found_for_wallet")
      return res.status(404).json({ error: "creator_not_found_for_wallet" });
    }

    // 2. MemeX /public/v1/user 호출해서 tokenAddress 가져오기
    const myInfo = await fetchMyInfo(creator.access_token);
    const tokenAddress: string | undefined = myInfo.tokenAddress;

    if (!tokenAddress) {
      console.error("MemeX user info has no tokenAddress", myInfo);
      return res.status(500).json({ error: "no_token_address_from_memex" });
    }

    console.log(`Allowing token address: ${tokenAddress}`)
    // 3. 온체인 Logger 화이트리스트 확인 + 필요시 setAllowedToken
    await allowTokenIfNeeded(tokenAddress as `0x${string}`);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

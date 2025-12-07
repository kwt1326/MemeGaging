import { Router } from "express";
import { prisma } from "../prisma";

export const walletRouter = Router();

walletRouter.post("/connect", async (req, res) => {
  try {
    const { wallet_address } = req.body as {
      wallet_address: string;
    };

    if (!wallet_address) {
      console.error("invalid_wallet_address")
      return res.status(400).json({ error: "invalid_wallet_address" });
    }

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

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

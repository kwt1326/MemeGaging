// TODO: MemeScore, 랭킹, 대시보드용 API 엔드포인트 추가
//  - GET /creators/:handle
//  - GET /creators/ranking
//  - GET /me/dashboard
//  - GET /tips/recent

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import { creatorRouter } from "./routes/creator";
import { dashboardRouter } from "./routes/dashboard";
import { walletRouter } from "./routes/wallet";
import { adminRouter } from "./routes/admin";
import { tipRouter } from "./routes/tip";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// 라우터
app.use("/creators", creatorRouter);
app.use("/dashboard", dashboardRouter);
app.use("/wallet", walletRouter);
app.use("/admin", adminRouter);
app.use("/tips", tipRouter);

// TODO: /tips 라우터 등 추가 가능

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// TODO: MemeScore, 랭킹, 대시보드용 API 엔드포인트 추가
//  - GET /creators/:handle
//  - GET /creators/ranking
//  - GET /me/dashboard
//  - GET /tips/recent

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

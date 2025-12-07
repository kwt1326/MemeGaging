import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import { creatorRouter } from "./routes/creator";
import { dashboardRouter } from "./routes/dashboard";
import { walletRouter } from "./routes/wallet";
import { tipRouter } from "./routes/tip";
import { scoreRouter } from "./routes/score";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/creators", creatorRouter);
app.use("/dashboard", dashboardRouter);
app.use("/wallet", walletRouter);
app.use("/tips", tipRouter);
app.use("/scores", scoreRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

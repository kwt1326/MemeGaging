import dotenv from "dotenv";

dotenv.config();

export const MEMEX_BASE_URL = process.env.MEMEX_BASE_URL ?? "https://insectarium-public-api.memex.xyz";
export const RPC_URL = process.env.RPC_URL!;
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
export const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY!;
export const OWNER_ADDRESS = process.env.OWNER_ADDRESS!;

import axios from "axios";

import { MEMEX_BASE_URL } from "../config";

const base = axios.create({
  baseURL: MEMEX_BASE_URL,
  headers: {
    accept: "application/json",
  },
});

export async function fetchMyInfo(accessToken: string) {
  const res = await base.get("/public/v1/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
}

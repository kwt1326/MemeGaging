import axios from "axios";

import { MEMEX_BASE_URL } from "../config";

export type MemexMockUser = {
  id: number;
  userName: string;
  displayName: string;
  userNameTag: string | null;
  walletAddress: string;
  accessToken: string;
};

export type MemexPost = {
  id: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  viewCount: number;
  // 필요한 필드만 일부 사용
};

const base = axios.create({
  baseURL: MEMEX_BASE_URL,
  headers: {
    accept: "application/json",
  },
});

// 특정 유저의 자기 정보 (/public/v1/user)
export async function fetchMyInfo(accessToken: string) {
  const res = await base.get("/public/v1/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
}

// 특정 유저의 포스트들 (/public/v1/user/{username}/{usernametag}/posts)
export async function fetchUserPosts(
  accessToken: string,
  userName: string,
  userNameTag: string | null,
  limit = 50,
  cursor?: string
): Promise<{
  contents: MemexPost[];
  nextCursor?: string;
}> {
  const tag = userNameTag ?? "";
  const res = await base.get(
    `/public/v1/user/${encodeURIComponent(userName)}/${encodeURIComponent(tag)}/posts`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        limit,
        cursor,
      },
    }
  );

  return {
    contents: res.data.contents ?? [],
    nextCursor: res.data.nextCursor,
  };
}

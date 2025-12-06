"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRanking } from "@/lib/api";

import GlobalRankingView from "./GlobalRankingView";

export default function GlobalRankingPage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => fetchRanking(100),
  });

  const creators = data?.creators ?? [];

  return (
    <GlobalRankingView
      creators={creators}
      loading={isLoading}
      error={error ? (error as Error).message : null}
    />
  );
}

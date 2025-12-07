"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRanking } from "@/lib/api";
import { useQueryEffects } from "@/hooks/useQueryEffects";

import { LeaderboardView } from "./leaderboard/LeaderboardView";

export default function LeaderboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ["ranking", searchQuery],
    queryFn: () => fetchRanking(20, searchQuery),
  });

  const {
    data,
    isLoading,
    error,
  } = useQueryEffects(query, {});

  const creators = data?.creators ?? [];

  return (
    <LeaderboardView
      creators={creators}
      loading={isLoading}
      error={error ? (error as Error).message : null}
      searchQuery={searchInput}
      onSearchChange={setSearchInput}
    />
  );
}

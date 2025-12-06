"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCreators } from "@/lib/api";

import CreatorSearchView from "./CreatorSearchView";

export default function CreatorSearchPage() {
  const [query, setQuery] = useState("");

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["creatorSearch", query],
    queryFn: () => searchCreators(query),
    enabled: false, // 버튼 눌렀을 때만 실행
  });

  const creators = data?.creators ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    refetch();
  };

  return (
    <CreatorSearchView
      query={query}
      onQueryChange={setQuery}
      onSearch={handleSearch}
      creators={creators}
      loading={isLoading}
      error={error ? (error as Error).message : null}
    />
  );
}

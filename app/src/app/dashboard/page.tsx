"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/api";

import DashboardView from "./DashboardView";

export default function DashboardPage() {
  const [creatorIdInput, setCreatorIdInput] = useState("");

  const creatorId = Number(creatorIdInput);
  const isValidId = !Number.isNaN(creatorId) && creatorId > 0;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", creatorId],
    queryFn: () => fetchDashboard(creatorId),
    enabled: false, // 버튼 클릭 시에만
  });

  const handleLoad = () => {
    if (!isValidId) return;
    refetch();
  };

  return (
    <DashboardView
      creatorIdInput={creatorIdInput}
      onCreatorIdChange={setCreatorIdInput}
      loading={isLoading}
      error={error ? (error as Error).message : null}
      data={data ?? null}
      onLoadDashboard={handleLoad}
    />
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/api";
import { useQueryEffects } from "@/hooks/useQueryEffects";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { DashboardView } from "./DashboardView";

export default function DashboardPage() {
  const { address, isConnected } = useWalletConnection();

  const query = useQuery({
    queryKey: ["dashboard", address],
    queryFn: () => fetchDashboard(address),
    enabled: isConnected && !!address,
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQueryEffects(query, {});

  return (
    <DashboardView
      loading={isLoading}
      data={data ?? null}
    />
  );
}

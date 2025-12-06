"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDisconnect, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { fetchCreatorDetail, notifyTip, fetchCreatorDetailByAddress } from "@/lib/api";
import { useWalletConnection } from "@/hooks/useWalletConnection";

import { CreatorDetailView } from "./CreatorDetailView";
import { useQueryEffects } from "@/hooks/useQueryEffects";

const LOGGER_ADDRESS =
  (process.env.NEXT_PUBLIC_TIP_LOGGER_ADDRESS as `0x${string}`) ??
  ("0x0000000000000000000000000000000000000000" as const);

const loggerAbi = [
  {
    type: "function",
    name: "tipWithToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "memexUserName", type: "string" },
      { name: "memexUserNameTag", type: "string" },
    ],
    outputs: [],
  },
] as const;

export default function CreatorDetailPage() {
  const params = useParams<{ id: string }>();
  const creatorId = Number(params.id);

  const { address, isConnected } = useWalletConnection();
  const { data: hash, writeContract } = useWriteContract()
  const { disconnect } = useDisconnect();

  const [myCreatorId, setMyCreatorId] = useState<number | null>(null);
  const [myTokenAddress, setMyTokenAddress] = useState<`0x${string}` | null>(null);
  const [tipPending, setTipPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["creatorDetail", creatorId],
    queryFn: () => fetchCreatorDetail(creatorId),
    enabled: !!creatorId,
  });

  const creatorDetailByAddressQuery = useQuery({
    queryKey: ["creatorDetailByAddress", address],
    queryFn: () => fetchCreatorDetailByAddress(address),
    enabled: !!address,
  });

  const creator = data?.creator ?? null;
  const stats = data?.stats ?? null;
  const recentTips = data?.recent_tips ?? [];

  const handleTip = async (tipAmount: string) => {
    try {
      setError(null);
      
      if (!creator || !myCreatorId) return;
      if (!myTokenAddress) {
        setError("먼저 지갑을 연동해서 토큰 화이트리스트를 등록해주세요.");
        return;
      }

      const amountWei = parseUnits(tipAmount, 18);
      setTipPending(true);

      console.log("writeContract waiting...", hash);

      writeContract({
        address: LOGGER_ADDRESS,
        abi: loggerAbi,
        functionName: "tipWithToken",
        args: [
          myTokenAddress,
          creator.wallet_address as `0x${string}`,
          amountWei,
          creator.user_name as string,
          (creator.user_name_tag as string) ?? "",
        ],
      }, {
        onSuccess: async (txHash) => {
          await notifyTip({
            to_creator_id: creator.id,
            from_creator_id: myCreatorId,
            token_address: myTokenAddress,
            amount: amountWei.toString(),
            tx_hash: txHash,
          });
          await refetch();
        }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Tip 전송 실패");
    } finally {
      setTipPending(false);
    }
  };

  useQueryEffects(creatorDetailByAddressQuery, {
    onSuccess: (data) => {
      setMyCreatorId(data.creator_id)
      setMyTokenAddress(data.token_address as `0x${string}`)
    }
  });

  console.log("test")
  
  return (
    <CreatorDetailView
      loading={isLoading}
      creator={creator}
      stats={stats}
      recentTips={recentTips}
      error={error ?? (queryError ? (queryError as Error).message : null)}
      isConnected={isConnected}
      walletAddress={address}
      tokenAddress={myTokenAddress}
      onDisconnect={disconnect}
      onTip={handleTip}
      tipPending={tipPending}
    />
  );
}
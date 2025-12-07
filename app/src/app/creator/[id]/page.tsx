"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { fetchCreatorDetail, notifyTip } from "@/lib/api";
import { useWalletConnection } from "@/hooks/useWalletConnection";

import { CreatorDetailView } from "./CreatorDetailView";
import { useQueryEffects } from "@/hooks/useQueryEffects";
import { useCreatorContext } from "@/contexts/CreatorContext";

const LOGGER_ADDRESS =
  (process.env.NEXT_PUBLIC_TIP_LOGGER_ADDRESS as `0x${string}`) ??
  ("0x0000000000000000000000000000000000000000" as const);

const loggerAbi = [
  {
    type: "function",
    name: "tipWithNative",
    stateMutability: "payable",
    inputs: [
      { name: "to", type: "address" },
      { name: "memexUserName", type: "string" },
      { name: "memexUserNameTag", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;


export default function CreatorDetailPage() {
  const params = useParams<{ id: string }>();
  const creatorId = Number(params.id);

  const { creator: meCreatorInfo } = useCreatorContext();
  const { address, isConnected } = useWalletConnection();
  const { writeContract } = useWriteContract();
  const { disconnect } = useDisconnect();

  const [tipPending, setTipPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipHash, setTipHash] = useState<`0x${string}` | undefined>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorStats, setCreatorStats] = useState<CreatorStat | null>(null);
  const [creatorRecentTips, setCreatorRecentTips] = useState<RecentTips | []>([]);
  const [pendingTipAmount, setPendingTipAmount] = useState<string>("0");

  const query = useQuery({
    queryKey: ["creatorDetail", creatorId],
    queryFn: () => fetchCreatorDetail(creatorId),
    enabled: !!creatorId,
  });

  // Check if logger contract is paused
  const { data: isContractPaused } = useReadContract({
    address: LOGGER_ADDRESS,
    abi: loggerAbi,
    functionName: "paused",
  });

  // Wait for tip transaction receipt
  const { isLoading: isTipPending, isSuccess: isTipConfirmed, error: tipError } = useWaitForTransactionReceipt({
    hash: tipHash,
  });

  // Watch for tip transaction confirmation and call notify API only after success
  useEffect(() => {
    if (isTipConfirmed && tipHash && tipPending && creator && meCreatorInfo?.id && pendingTipAmount !== "0") {
      const notifyBackend = async () => {
        try {
          // Call backend notify API to record tip
          await notifyTip({
            to_creator_id: creator.id,
            from_creator_id: meCreatorInfo.id,
            token_address: "0x0000000000000000000000000000000000000000", // Native coin
            amount: pendingTipAmount,
            tx_hash: tipHash,
          });
          
          alert("Tip sent successfully!");
          
          // Force refetch with a small delay to ensure backend has processed
          setTimeout(async () => {
            const result = await query.refetch();
            if (result.data) {
              setCreator(result.data.creator);
              setCreatorStats({
                ...result.data.stats,
                score_breakdown: result.data.score_breakdown
              });
              setCreatorRecentTips(result.data.recent_tips);
            }
          }, 500);
        } catch (err: any) {
          console.error("Failed to notify tip:", err);
          setError("Tip was sent on-chain but failed to record: " + err.message);
        } finally {
          setTipPending(false);
          setTipHash(undefined);
          setPendingTipAmount("0");
        }
      };

      notifyBackend();
    }
  }, [isTipConfirmed, tipHash, tipPending, creator, meCreatorInfo, pendingTipAmount, query]);

  // Watch for tip transaction failure
  useEffect(() => {
    if (tipError && tipPending) {
      setError("Tip 트랜잭션 실패: " + (tipError as any).message);
      setTipPending(false);
      setTipHash(undefined);
      setPendingTipAmount("0");
    }
  }, [tipError, tipPending]);

  const handleTip = async (tipAmount: string) => {
    try {
      setError(null);

      if (!creator || !meCreatorInfo?.id) {
        setError("크리에이터 정보가 없습니다.");
        console.info("크리에이터 정보가 없습니다.")
        return;
      }
      
      if (!address) {
        setError("지갑을 먼저 연결해주세요.");
        console.info("지갑을 먼저 연결해주세요.")
        return;
      }

      if (isContractPaused) {
        setError("Tip 기능이 일시 중지되었습니다.");
        console.info("Tip 기능이 일시 중지되었습니다.")
        return;
      }

      const amountWei = parseUnits(tipAmount, 18);
      setPendingTipAmount(amountWei.toString());
      setTipPending(true);

      // Send native coin tip
      writeContract(
        {
          address: LOGGER_ADDRESS,
          abi: loggerAbi,
          functionName: "tipWithNative",
          args: [
            creator.wallet_address as `0x${string}`,
            creator.user_name as string,
            (creator.user_name_tag as string) ?? "",
          ],
          value: amountWei,
        },
        {
          onSuccess: (txHash) => {
            console.info("테스트 성공")
            setTipHash(txHash);
          },
          onError: (err) => {
            console.info("테스트 실패")
            setError("Tip 전송 실패: " + err.message);
            setTipPending(false);
            setPendingTipAmount("0");
          },
        }
      );
    } catch (err: any) {
      setError(err.message ?? "Tip 전송 실패");
      setTipPending(false);
      setPendingTipAmount("0");
    }
  };

  const creatorDetailQuery = useQueryEffects(query, {
    onSuccess: (data) => {
      setCreator(data.creator)
      // Merge stats and score_breakdown into one object
      setCreatorStats({
        ...data.stats,
        score_breakdown: data.score_breakdown
      })
      setCreatorRecentTips(data.recent_tips)
    }
  });
  
  const renderError = error ?? (creatorDetailQuery.error ? (creatorDetailQuery.error as Error).message : null)

  return (
    <CreatorDetailView
      loading={creatorDetailQuery.isLoading}
      creator={creator}
      stats={creatorStats}
      recentTips={creatorRecentTips}
      error={renderError}
      isConnected={isConnected}
      walletAddress={address}
      tipPending={tipPending || isTipPending}
      onDisconnect={disconnect}
      onTip={handleTip}
    />
  );
}
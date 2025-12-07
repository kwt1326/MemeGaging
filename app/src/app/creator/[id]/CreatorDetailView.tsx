import { useState } from 'react';
import { StatCard } from '../../../components/StatCard';
import { UserAvatar } from '../../../components/UserAvatar';
import { CreatorName } from '../../../components/CreatorName';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { weiToEthFormatted } from '@/lib/utils';

type CreatorDetailViewProps = {
  loading: boolean;
  creator: any | null;
  stats: any | null;
  recentTips: any[];
  aiAnalysis: any | null;
  error: string | null;
  isConnected: boolean;
  walletAddress?: `0x${string}` | undefined;
  onDisconnect: () => void;
  onTip: (amount: string) => void | Promise<void>;
  tipPending: boolean;
};

export function CreatorDetailView({
  loading,
  creator,
  stats,
  recentTips,
  aiAnalysis,
  onTip,
  tipPending,
}: CreatorDetailViewProps) {
  const [tipAmount, setTipAmount] = useState("1");

  if (loading || !creator) {
    return (
      <div className="pl-2 pt-2">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Profile Header */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <UserAvatar size="lg" />
              <div>
                <h1 className="text-2xl mb-1">
                  <CreatorName
                    displayName={creator.display_name}
                    userName={creator.user_name}
                    userNameTag={creator.user_name_tag}
                  />
                </h1>
                <div className="text-gray-500">Platinum</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">
                {stats?.score_breakdown?.memeScore?.toFixed(1) || creator?.meme_score?.toFixed(1) || "0"}
              </div>
              <div className="text-gray-500 text-sm">MemeScore</div>
              <div className="text-gray-500 text-sm">
                Tips: {stats?.tip_count_7d || 0} / Amount: {stats?.tip_amount_total_7d ? (weiToEthFormatted(stats.tip_amount_total_7d) + " tokens") : "0"}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard 
            label="EngagementScore" 
            value={stats?.score_breakdown?.engagementScore?.toFixed(1) || "0"} 
          />
          <StatCard 
            label="ViewScore" 
            value={stats?.score_breakdown?.viewScore?.toFixed(1) || "0"} 
          />
          <StatCard 
            label="FollowScore" 
            value={stats?.score_breakdown?.followScore?.toFixed(1) || "0"} 
          />
          <StatCard 
            label="TipScore" 
            value={stats?.score_breakdown?.tipScore?.toFixed(1) || "0"} 
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - AI Analysis */}
          <div className="col-span-2 space-y-6">
            {/* AI Activity Summary */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">AI Activity Summary (7D)</h2>
              </div>
              <p className="text-gray-500 mb-3">
                Auto-generated from your MemeX activity and on-chain tips.
              </p>
              
              {/* AI 분석 로딩 중 - 스켈레톤 UI */}
              {!aiAnalysis && (
                <div className="space-y-3 animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="text-center text-gray-400 text-sm mt-4">
                    🤖 AI 분석 중...
                  </div>
                </div>
              )}
              
              {/* AI 분석 결과 표시 */}
              {aiAnalysis && (
                <div className="space-y-2">
                  {aiAnalysis.analysis.split('\n').map((line: string, idx: number) => {
                    // 빈 줄 처리
                    if (!line.trim()) {
                      return <div key={idx} className="h-2"></div>;
                    }
                    // 헤더 처리 (🤖로 시작)
                    if (line.startsWith('🤖')) {
                      return (
                        <h3 key={idx} className="text-lg font-semibold mb-2">
                          {line}
                        </h3>
                      );
                    }
                    // Bullet point 처리
                    if (line.trim().startsWith('▪')) {
                      return (
                        <div key={idx} className="flex gap-2">
                          <span className="text-black">▪</span>
                          <span>{line.trim().substring(1).trim()}</span>
                        </div>
                      );
                    }
                    // 일반 텍스트
                    return (
                      <p key={idx} className="text-gray-500 text-sm">
                        {line}
                      </p>
                    );
                  })}
                  
                  {/* 봇 점수 경고 */}
                  {aiAnalysis.bot_score >= 50 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ 봇 의심 점수: {aiAnalysis.bot_score.toFixed(1)}/100
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        활동 패턴이 비정상적으로 보일 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Send Tips */}
            <Card>
              <h3 className="text-gray-400 mb-4">Send Tip to this creator</h3>
              {tipPending && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  ⏳ Processing... Please confirm transactions in your wallet
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button size="lg" onClick={() => onTip("0.1")} disabled={tipPending}>
                  0.1 M
                </Button>
                <Button size="lg" onClick={() => onTip("0.5")} disabled={tipPending}>
                  0.5 M
                </Button>
                <Button size="lg" onClick={() => onTip("1")} disabled={tipPending}>
                  1 M
                </Button>
              </div>
            </Card>
            {/* Recent Tips */}
            <Card padding="none">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl">Recent Tips</h2>
                <div className="flex gap-4 text-sm text-gray-600 mt-2">
                  <span>From</span>
                  <span className="ml-auto">Amount</span>
                  <span className="w-24 text-right">Time</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentTips && recentTips.length > 0 ? (
                  recentTips.slice(0, 10).map((tip: any, index: number) => {
                    const timeAgo = new Date(tip.created_at).toLocaleString();
                    return (
                      <div key={index} className="px-6 py-3 flex items-center gap-4">
                        <UserAvatar size="sm" />
                        <span className="text-sm">{tip.from_creator_id ? `Creator #${tip.from_creator_id}` : 'Anonymous'}</span>
                        <span className="ml-auto">{weiToEthFormatted(tip.amount)} tokens</span>
                        <span className="w-24 text-right text-sm text-gray-500">{timeAgo}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-3 text-center text-gray-500">No recent tips</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

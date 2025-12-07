import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { UserAvatar } from '@/components/UserAvatar';
import { CreatorName } from '@/components/CreatorName';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { weiToEth, weiToEthFormatted } from '@/lib/utils';

type DashboardViewProps = {
  loading: boolean;
  data: any | null;
  onRefreshAnalysis: () => void;
};

export function DashboardView({
  loading,
  data,
  onRefreshAnalysis,
}: DashboardViewProps) {
  const router = useRouter();

  const handleRowClick = (creatorId: number) => {
    router.push(`/creator/${creatorId}`);
  };
  const tippedCreators = data?.tipped_creators || [];
  const totalContributed = data?.total_contributed_amount || "0";
  const myScore = data?.my_score;
  const aiAnalysis = data?.ai_analysis;

  const uniqueCreatorsCount = data?.unique_creators_count || 0;
  const totalTipCount = data?.total_tip_count || 0;
  const totalTipAmountEther = weiToEth(totalContributed);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="EngagementScore" 
            value={myScore?.engagement_score?.toFixed(1) || "0"} 
          />
          <StatCard 
            label="ViewScore" 
            value={myScore?.view_score?.toFixed(1) || "0"} 
          />
          <StatCard 
            label="FollowScore" 
            value={myScore?.follow_score?.toFixed(1) || "0"} 
          />
          <StatCard 
            label="TipScore" 
            value={myScore?.tip_score?.toFixed(1) || "0"} 
          />
        </div>

        <Card padding="none" className="mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl">Recent Tips</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">CREATOR</th>
                <th className="px-6 py-3 text-left">MY TIP AMOUNT</th>
                <th className="px-6 py-3 text-left">TIP COUNT</th>
                <th className="px-6 py-3 text-left">MEMESCORE</th>
              </tr>
            </thead>
            <tbody>
              {tippedCreators.length > 0 ? (
                tippedCreators.map((item: any, index: number) => {
                  const creator = item.creator;
                  return (
                    <tr 
                      key={index} 
                      onClick={() => handleRowClick(item.to_creator_id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar size="sm" />
                          <CreatorName
                            displayName={creator?.display_name || 'Unknown'}
                            userName={creator?.user_name || 'N/A'}
                            userNameTag={creator?.user_name_tag}
                            usernameClassName="text-xs text-gray-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">{weiToEthFormatted(item.amount_total)} tokens</td>
                      <td className="px-6 py-4">{item.tip_count}</td>
                      <td className="px-6 py-4">{creator?.meme_score?.toFixed(1) || '0'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No tips sent yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total Tip Amount"
            value={`${totalTipAmountEther.toFixed(4)} tokens`}
            subtitle="Total Amount tipped"
          />
          <StatCard
            label="Total Tip Count"
            value={totalTipCount.toString()}
            subtitle="Total number of tips sent"
          />
          <StatCard
            label="Unique Creators"
            value={uniqueCreatorsCount.toString()}
            subtitle="Number of unique creators tipped"
          />
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">AI Summary – My Activity Report</h2>
            <Button variant="outline" onClick={onRefreshAnalysis}>Re-run analysis</Button>
          </div>
          <p className="text-gray-500 mb-3">
            Automatically generated report based on your MemeScore, engagement and tipping data.
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
    </div>
  );
}

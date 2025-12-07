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
};

export function DashboardView({
  loading,
  data,
}: DashboardViewProps) {
  const router = useRouter();

  const handleRowClick = (creatorId: number) => {
    router.push(`/creator/${creatorId}`);
  };
  const tippedCreators = data?.tipped_creators || [];
  const totalContributed = data?.total_contributed_amount || "0";
  const myScore = data?.my_score;

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
            <Button variant="outline">Re-run analysis</Button>
          </div>
          <p className="text-gray-500 mb-4">
            Automatically generated report based on your MemeScore, engagement and tipping data.
          </p>
          <p className="text-gray-400 mb-4">
            Your MemeScore increased from 8.120 to 8.647 and your rank improved from #52 to #45. This represents a solid 6.5% growth in your overall engagement metrics.
          </p>
          <p className="text-gray-400 mb-4">
            You made 51 tips, with the majority going to three favorite creators, and your likes and comments remained stable. Your tipping pattern shows consistent support for high-performing creators.
          </p>
          <p className="text-gray-400 mb-4">
            Increase meaningful comments and continue supporting top creators to further boost your MemeScore. Consider diversifying your engagement across more creators to maximize growth potential.
          </p>
          <div className="flex justify-end">
            <Button variant="ghost">View top creators</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

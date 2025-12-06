import Link from 'next/link';
import { StatCard } from '../../components/StatCard';
import { UserAvatar } from '../../components/UserAvatar';
import { recentTipsData } from '../../data/mockData';

type DashboardViewProps = {
  creatorIdInput: string;
  onCreatorIdChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  data: any | null;
  onLoadDashboard: () => void;
};

export function DashboardView({
  creatorIdInput,
  onCreatorIdChange,
  loading,
  error,
  data,
  onLoadDashboard,
}: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard label="EngagementScore (7D)" value="85.2" />
          <StatCard label="ViewScore (7D)" value="78.3" />
          <StatCard label="FollowScore (total)" value="93.6" />
          <StatCard label="TipScore (7D)" value="75.5" />
        </div>

        {/* Recent Tips Table */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
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
                <th className="px-6 py-3 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {recentTipsData.map((tip, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar size="sm" />
                      <span>{tip.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{tip.tipAmount}</td>
                  <td className="px-6 py-4">{tip.tipCount}</td>
                  <td className="px-6 py-4">{tip.memeScore.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Link href={`/creator/${tip.username}`}>
                      <button className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                        Open Creator
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total Tip Amount (7D)"
            value="52.2 M"
            subtitle="Total Amount tipped in last 7 days"
          />
          <StatCard
            label="Total Tip Count (7D)"
            value="35"
            subtitle="Number of tips sent in last 7 days"
          />
          <StatCard
            label="Total MemeScore Contribution"
            value="+583"
            subtitle="Your contribution to creator memescore"
          />
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">AI Summary – My Activity Report (7D)</h2>
            <button className="px-4 py-2 text-gray-500 border border-gray-300 rounded hover:bg-gray-50">
              Re-run analysis
            </button>
          </div>
          <p className="text-gray-500 mb-4">
            Automatically generated report based on your MemeScore, engagement and tipping data.
          </p>
          <p className="text-gray-400 mb-4">
            In the last 7 days your MemeScore increased from 8.120 to 8.647 and your rank improved from #52 to #45. This represents a solid 6.5% growth in your overall engagement metrics.
          </p>
          <p className="text-gray-400 mb-4">
            You made 51 tips, with the majority going to three favorite creators, and your likes and comments remained stable. Your tipping pattern shows consistent support for high-performing creators.
          </p>
          <p className="text-gray-400 mb-4">
            Increase meaningful comments and continue supporting top creators to further boost your MemeScore. Consider diversifying your engagement across more creators to maximize growth potential.
          </p>
          <div className="flex justify-end">
            <button className="text-gray-400 underline">View top creators</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from 'next/navigation';
import { UserAvatar } from '../../components/UserAvatar';
import { CreatorName } from '../../components/CreatorName';
import { Card } from '../../components/Card';
import { weiToEth } from '@/lib/utils';

type LeaderboardViewProps = {
  creators: Creators;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function LeaderboardView({
  creators,
  loading,
  error,
  searchQuery,
  onSearchChange,
}: LeaderboardViewProps) {
  const router = useRouter();

  const handleRowClick = (creatorId: number) => {
    router.push(`/creator/${creatorId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by display name"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl">MemeX Mindshare Leaderboard</h1>
            <div className="flex items-center gap-2">
              <span className="ml-4 text-gray-600">Sort by MemeScore</span>
            </div>
          </div>
          <p className="text-gray-600">
            Discover the top performers in the meme ecosystem based on engagement and community impact
          </p>
        </div>

        {/* Leaderboard Table */}
        <Card padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">MemeScore</th>
                <th className="px-6 py-4 text-left">Engagement</th>
                <th className="px-6 py-4 text-left">Followers</th>
                <th className="px-6 py-4 text-left">Views</th>
                <th className="px-6 py-4 text-left">Tips</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && creators.map((creator, i) => {
                const score = creator.score;
                const tipAmount = score?.tip_amount ? weiToEth(score.tip_amount) : 0;
                
                return (
                  <tr 
                    key={creator.id} 
                    onClick={() => handleRowClick(creator.id)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                          {i + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar size="sm" />
                        <CreatorName
                          displayName={creator.display_name}
                          userName={creator.user_name}
                          userNameTag={creator.user_name_tag}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{score?.meme_score?.toFixed(1) || creator.meme_score?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{score?.engagement_score?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{score?.followers?.toLocaleString() || '0'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{score?.views?.toLocaleString() || '0'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {score?.tip_count || 0} / {tipAmount.toFixed(4)} M
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
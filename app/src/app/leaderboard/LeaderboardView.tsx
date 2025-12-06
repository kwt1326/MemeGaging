import Link from 'next/link';
import { UserAvatar } from '../../components/UserAvatar';

type LeaderboardViewProps = {
  creators: Creators;
  loading: boolean;
  error: string | null;
};

export function LeaderboardView({
  creators,
  loading,
  error,
}: LeaderboardViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search MemeX user (username#tag)"
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl">MemeX Mindshare Leaderboard (7D)</h1>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-gray-700 text-white rounded">7D</button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded">30D</button>
              <span className="ml-4 text-gray-600">Sort by MemeScore</span>
            </div>
          </div>
          <p className="text-gray-600">
            Discover the top performers in the meme ecosystem based on engagement and community impact
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">MemeScore</th>
                <th className="px-6 py-4 text-left">Engagement(7D)</th>
                <th className="px-6 py-4 text-left">Views (7D)</th>
                <th className="px-6 py-4 text-left">Tip (7D)</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => (
                <tr key={creator.meme_score} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                        {creator.meme_score}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar size="sm" />
                      <div>
                        <p>
                          {creator.display_name}{" "}
                          <span className="text-xs text-muted-foreground">
                            @{creator.user_name}
                            {creator.user_name_tag ? `#${creator.user_name_tag}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{creator.meme_score.toLocaleString()}</div>
                    {/* <div className="text-green-600 text-sm">{creator.memeScoreChange}</div> */}
                  </td>
                  <td className="px-6 py-4">
                    {/* <div>{creator.engagement.toLocaleString()}</div> */}
                    <div className="text-gray-500 text-sm">likes/shares</div>
                  </td>
                  {/* <td className="px-6 py-4">{creator.views}</td>
                  <td className="px-6 py-4">{creator.tip}</td> */}
                  <td className="px-6 py-4">{0}</td>
                  <td className="px-6 py-4">{0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/creator/${creator.id}`}>
                        <button className="px-4 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                          Detail
                        </button>
                      </Link>
                      <button className="px-4 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        7D
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="px-3 py-1 border border-gray-300 rounded">&lt;</button>
          <button className="px-3 py-1 bg-gray-700 text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded">3</button>
          <span>...</span>
          <button className="px-3 py-1 border border-gray-300 rounded">10</button>
          <button className="px-3 py-1 border border-gray-300 rounded">&gt;</button>
        </div>
      </div>
    </div>
  );
}
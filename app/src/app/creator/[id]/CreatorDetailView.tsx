import { useState } from 'react';
import { StatCard } from '../../../components/StatCard';
import { UserAvatar } from '../../../components/UserAvatar';
import { creatorTipsData } from '../../../data/mockData';

type CreatorDetailViewProps = {
  loading: boolean;
  creator: any | null;
  stats: any | null;
  recentTips: any[];
  error: string | null;
  isConnected: boolean;
  walletAddress?: `0x${string}` | undefined;
  tokenAddress: `0x${string}` | null;
  onDisconnect: () => void;
  onTip: (amount: string) => void | Promise<void>;
  tipPending: boolean;
};

export function CreatorDetailView({
  loading,
  creator,
  stats,
  recentTips,
  error,
  tokenAddress,
  onTip,
  tipPending,
}: CreatorDetailViewProps) {
  const [tipAmount, setTipAmount] = useState("1");

  if (loading) {
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
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <UserAvatar size="lg" />
              <div>
                <h1 className="text-2xl mb-1">
                  <p>
                    {creator.display_name}{" "}
                    <span className="text-xs text-muted-foreground">
                      @{creator.user_name}
                      {creator.user_name_tag ? `#${creator.user_name_tag}` : ""}
                    </span>
                  </p>
                </h1>
                <div className="text-gray-500">Platinum</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">83.15</div>
              <div className="text-gray-500 text-sm">MemeScore (7D)</div>
              <div className="text-gray-500 text-sm">Global Rank #1 / Top 1% this week</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard label="EngagementScore (7D)" value="85.2" />
          <StatCard label="ViewScore (7D)" value="78.3" />
          <StatCard label="FollowScore (total)" value="93.6" />
          <StatCard label="TipScore (7D)" value="75.5" />
        </div>

        <div>
        {/* <div className="grid grid-cols-3 gap-6"> */}
          {/* Left Column - MemeScore Chart (Commented Out) */}
          {/* <div className="col-span-2 space-y-6"> */}
            {/* MemeScore Line Chart - Commented Out as per requirements */}
            {/* 
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">MemeScore (7D)</h2>
              <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                <span className="text-gray-400">Line chart Placeholder - 7-day MemeScore Trend</span>
              </div>
            </div>
            */}

            {/* AI Activity Summary - Commented Out as per requirements */}
            {/* 
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">AI Activity Summary (7D)</h2>
                <button className="px-4 py-2 text-gray-500 border border-gray-300 rounded hover:bg-gray-50">
                  Re-run analysis
                </button>
              </div>
              <p className="text-gray-500 mb-3">
                Auto-generated from your MemeX activity and on-chain tips.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-black">▪</span>
                  <span>Your MemeScore increased from 65.1 to 78.4 in the last 7 days.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-black">▪</span>
                  <span>Your global rank moved from #27 to #12 among active MemeX creators.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-black">▪</span>
                  <span>Likes, comments, reposts and views were the main drivers of this increase.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-black">▪</span>
                  <span>On-chain tips contributed as an extra boost, but had a smaller impact this week.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-black">▪</span>
                  <span>To keep growing your MemeScore, focus on comments, reposts and high-quality meme posts.</span>
                </li>
              </ul>
              <p className="text-gray-400 text-sm mt-4">
                For demo purposes only. Not financial advice.
              </p>
            </div>
            */}
          {/* </div> */}

          {/* Right Column */}
          <div className="space-y-6">
            {/* Send Tips */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-gray-400 mb-4">Send Tip to this creator</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onTip(tipAmount)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  0.01 M
                </button>
                <button
                  onClick={() => onTip(tipAmount)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  0.05 M
                </button>
                <button
                  onClick={() => onTip(tipAmount)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  0.1 M
                </button>
                <button
                  onClick={() => onTip(tipAmount)}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Send Tip
                </button>
              </div>
            </div>
            {/* Recent Tips */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl">Recent Tips</h2>
                <div className="flex gap-4 text-sm text-gray-600 mt-2">
                  <span>From</span>
                  <span className="ml-auto">Amount</span>
                  <span className="w-24 text-right">Time</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {creatorTipsData.map((tip: any, index: number) => (
                  <div key={index} className="px-6 py-3 flex items-center gap-4">
                    <UserAvatar size="sm" />
                    <span className="text-sm">{tip.from}</span>
                    <span className="ml-auto">{tip.amount}</span>
                    <span className="w-24 text-right text-sm text-gray-500">{tip.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Tips */}
            {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Send Tips to this Creator</h2>
                <button className="text-sm text-gray-500 underline">custom</button>
              </div>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => onTip(tipAmount)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  0.1 M
                </button>
                <button
                  onClick={() => onTip(tipAmount)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  0.1 M
                </button>
              </div>
              <button
                onClick={() => onTip(tipAmount)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Send Tip
              </button>
            </div> */}
          </div>
        </div>

        {/* Bottom Send Tip Section */}
        {/* <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h3 className="text-gray-400 mb-4">Send Tip to this creator</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTip(tipAmount)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              0.01 M
            </button>
            <button
              onClick={() => onTip(tipAmount)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              0.05 M
            </button>
            <button
              onClick={() => onTip(tipAmount)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              0.1 M
            </button>
            <button
              onClick={() => onTip(tipAmount)}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Send Tip
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}

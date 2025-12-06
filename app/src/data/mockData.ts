export interface LeaderboardUser {
  rank: number;
  username: string;
  badge: string;
  memeScore: number;
  memeScoreChange: string;
  engagement: number;
  views: string;
  tip: string;
}

export interface RecentTip {
  username: string;
  tipAmount: string;
  tipCount: string;
  memeScore: number;
}

export interface CreatorTip {
  from: string;
  amount: string;
  time: string;
}

export const leaderboardData: LeaderboardUser[] = [
  {
    rank: 1,
    username: 'test1#1234',
    badge: 'Platinum',
    memeScore: 11564,
    memeScoreChange: '+3.52%',
    engagement: 53234,
    views: '123k',
    tip: '$522.3 M'
  },
  {
    rank: 2,
    username: 'test2#2234',
    badge: 'Platinum',
    memeScore: 7984,
    memeScoreChange: '+5.59%',
    engagement: 37445,
    views: '53.4k',
    tip: '$412.2 M'
  },
  {
    rank: 3,
    username: 'test3#3234',
    badge: 'Gold',
    memeScore: 6474,
    memeScoreChange: '+4.21%',
    engagement: 25254,
    views: '27.7k',
    tip: '$341.3 M'
  },
  {
    rank: 4,
    username: 'test4#4234',
    badge: 'Gold',
    memeScore: 6433,
    memeScoreChange: '+11.5%',
    engagement: 22284,
    views: '34.2k',
    tip: '$212.3 M'
  },
  {
    rank: 5,
    username: 'test5#5234',
    badge: 'Silver',
    memeScore: 4234,
    memeScoreChange: '+7.43%',
    engagement: 17934,
    views: '5.5k',
    tip: '$122.3 M'
  },
  {
    rank: 6,
    username: 'test6#6234',
    badge: 'Silver',
    memeScore: 4234,
    memeScoreChange: '+7.43%',
    engagement: 17934,
    views: '5.5k',
    tip: '$122.3 M'
  },
  {
    rank: 7,
    username: 'test6#6234',
    badge: 'Bronze',
    memeScore: 4234,
    memeScoreChange: '+7.43%',
    engagement: 17934,
    views: '5.5k',
    tip: '$122.3 M'
  },
  {
    rank: 8,
    username: 'test6#6234',
    badge: 'Bronze',
    memeScore: 4234,
    memeScoreChange: '+7.43%',
    engagement: 17934,
    views: '5.5k',
    tip: '$122.3 M'
  },
  {
    rank: 9,
    username: 'test6#6234',
    badge: 'Iron',
    memeScore: 4234,
    memeScoreChange: '+7.43%',
    engagement: 17934,
    views: '5.5k',
    tip: '$122.3 M'
  },
  {
    rank: 10,
    username: 'test6#6234',
    badge: 'Iron',
    memeScore: 4234,
    memeScoreChange: '+7.43%',
    engagement: 17934,
    views: '5.5k',
    tip: '$122.3 M'
  }
];

export const recentTipsData: RecentTip[] = [
  { username: '@test2#1234', tipAmount: '22.3 M', tipCount: '123k', memeScore: 12852 },
  { username: '@test2#1234', tipAmount: '22.3 M', tipCount: '79.2k', memeScore: 12852 },
  { username: '@test2#1234', tipAmount: '22.3 M', tipCount: '123k', memeScore: 12852 },
  { username: '@test2#1234', tipAmount: '22.3 M', tipCount: '123k', memeScore: 12852 }
];

export const creatorTipsData: CreatorTip[] = [
  { from: '0x53r8...vi2a', amount: '1.36M', time: '2 hours ago' },
  { from: '0x2r85...azb7', amount: '0.67M', time: '3 hours ago' },
  { from: '0x57b8...3jjа', amount: '1.44M', time: '4 hours ago' },
  { from: '0x6uf8...9hn4', amount: '4.34M', time: '12 hours ago' },
  { from: '0x45d5...zi76', amount: '1.27M', time: '1 days ago' },
  { from: '0x55rn8...37s4', amount: '0.64M', time: '2 days ago' },
  { from: '0xjj89...3q1a', amount: '0.74M', time: '1 weeks ago' }
];

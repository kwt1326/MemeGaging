import { prisma } from "../prisma";
import { fetchUserPosts, fetchMyInfo } from "../clients/memexClient";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type Stats7d = {
  likes: number;
  replies: number;
  reposts: number;
  views: number;
  followers: number;
};

function calcMemeScoreV1(stats: Stats7d): number {
  const { likes, replies, reposts, views, followers } = stats;

  const L = Math.log10(1 + likes);
  const R = Math.log10(1 + replies);
  const RP = Math.log10(1 + reposts);
  const V = Math.log10(1 + views);
  const F = Math.log10(1 + followers);

  return 2.0 * L + 3.0 * R + 4.0 * RP + 0.5 * V + 1.5 * F;
}

export async function computeStatsForCreator(creatorId: number): Promise<Stats7d> {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) throw new Error("creator_not_found");

  const now = Date.now();
  const since = now - SEVEN_DAYS_MS;

  let cursor: string | undefined;
  let done = false;

  let likes = 0;
  let replies = 0;
  let reposts = 0;
  let views = 0;

  while (!done) {
    const { contents, nextCursor } = await fetchUserPosts(
      creator.access_token,
      creator.user_name,
      creator.user_name_tag,
      50,
      cursor
    );

    for (const post of contents) {
      const createdAt = new Date(post.createdAt).getTime();
      if (createdAt < since) {
        done = true;
        break;
      }
      likes += post.likeCount ?? 0;
      replies += post.replyCount ?? 0;
      reposts += post.repostCount ?? 0;
      views += post.viewCount ?? 0;
    }

    if (!nextCursor || contents.length === 0) {
      break;
    }
    cursor = nextCursor;
  }

  // 팔로워 수는 /user 에서 가져오기
  const me = await fetchMyInfo(creator.access_token);
  const followers = me.followers ?? 0;

  return { likes, replies, reposts, views, followers };
}

export async function recomputeMemeScoreForCreator(creatorId: number) {
  const stats = await computeStatsForCreator(creatorId);
  const memeScore = calcMemeScoreV1(stats);

  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      meme_score: memeScore,
    },
  });

  return { stats, memeScore };
}

// 전체 3000명 대상으로 재계산 (해커톤용 수동 triggering)
export async function recomputeAllCreatorsMemeScore() {
  const creators = await prisma.creator.findMany({
    select: { id: true },
  });

  for (const c of creators) {
    try {
      await recomputeMemeScoreForCreator(c.id);
      console.log("updated meme_score for creator", c.id);
    } catch (err) {
      console.error("failed to update creator", c.id, err);
    }
  }
}

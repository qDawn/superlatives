import { db } from '@/server/db'
import { communityPresets, presetVotes, presetFollows } from '@/server/db/schema/community'
import { eq, and, ne } from 'drizzle-orm'

export async function getCommunityPresets(currentUserId: string) {
  const presets = await db.query.communityPresets.findMany({
    where: and(
      ne(communityPresets.visibility, 'private'),
      eq(communityPresets.isUnpublished, false)
    ),
    with: {
      creator: true,
      votes: true,
      follows: true,
    },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  })

  return presets.map(p => {
    const upvotes = p.votes.filter(v => v.voteValue === 'up').length
    const downvotes = p.votes.filter(v => v.voteValue === 'down').length
    const score = upvotes - downvotes
    const myVote = p.votes.find(v => v.userId === currentUserId)?.voteValue ?? null
    const isFollowing = p.follows.some(f => f.userId === currentUserId)
    const isOwn = p.createdBy === currentUserId

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      questions: JSON.parse(p.questionsJson),
      visibility: p.visibility,
      createdAt: p.createdAt,
      creatorName: p.visibility === 'anonymised' ? 'Anonymous' : p.creator.name,
      upvotes,
      downvotes,
      score,
      myVote,
      isFollowing,
      isOwn,
      followerCount: p.follows.length,
    }
  }).sort((a, b) => b.score - a.score)
}

export async function getMyPrivatePresets(userId: string) {
  const presets = await db.query.communityPresets.findMany({
    where: and(
      eq(communityPresets.visibility, 'private'),
      eq(communityPresets.createdBy, userId)
    ),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  })

  return presets.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    questions: JSON.parse(p.questionsJson),
    createdAt: p.createdAt,
  }))
}

export async function getMyDrafts(userId: string) {
  const drafts = await db.query.presetDrafts.findMany({
    where: (d, { eq: eqFn }) => eqFn(d.createdBy, userId),
    orderBy: (d, { desc }) => [desc(d.updatedAt)],
  })

  return drafts.map(d => ({
    id: d.id,
    name: d.name,
    questions: JSON.parse(d.questionsJson),
    updatedAt: d.updatedAt,
  }))
}

export async function getFollowedPresets(userId: string) {
  const follows = await db.query.presetFollows.findMany({
    where: eq(presetFollows.userId, userId),
    with: {
      preset: true,
    },
  })

  return follows
    .filter(f => !f.preset.isUnpublished)
    .map(f => ({
      id: f.preset.id,
      name: f.preset.name,
      questions: JSON.parse(f.preset.questionsJson),
    }))
}

export async function getAllCommunityPresetsForAdmin() {
  const presets = await db.query.communityPresets.findMany({
    where: ne(communityPresets.visibility, 'private'),
    with: {
      creator: true,
      votes: true,
    },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  })

  return presets.map(p => {
    const upvotes = p.votes.filter(v => v.voteValue === 'up').length
    const downvotes = p.votes.filter(v => v.voteValue === 'down').length
    return {
      id: p.id,
      name: p.name,
      creatorName: p.creator.name,
      creatorEmail: p.creator.email,
      visibility: p.visibility,
      isUnpublished: p.isUnpublished,
      upvotes,
      downvotes,
      createdAt: p.createdAt,
    }
  })
}
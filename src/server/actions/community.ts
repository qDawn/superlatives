'use server'

import { db } from '@/server/db'
import { communityPresets, presetVotes, presetFollows, presetDrafts } from '@/server/db/schema/community'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/is-admin'
import { publishRatelimit } from '@/lib/rate-limit'

const questionSchema = z.object({
  text: z.string().min(1).max(500),
  questionType: z.enum(['single_select', 'multi_select', 'group_combination']),
  maxSelections: z.number().min(1).max(20),
  displayOrder: z.number(),
  isSkippable: z.boolean(),
  shuffleOptions: z.boolean(),
  allowMultipleGroupAnswers: z.boolean(),
})

const publishSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300),
  visibility: z.enum(['public', 'anonymised', 'private']),
  questions: z.array(questionSchema).min(1).max(100),
})

export async function publishPreset(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }
  
  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await publishRatelimit.limit(ip)
  if (!success) return { error: 'Too many requests. Please try again later.' }

  const parsed = publishSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    visibility: formData.get('visibility'),
    questions: JSON.parse(formData.get('questionsJson') as string),
  })

  if (!parsed.success) return { error: 'Invalid input: ' + parsed.error.issues[0].message }

  const { name, description, visibility, questions } = parsed.data

  const [preset] = await db.insert(communityPresets).values({
    createdBy: session.user.id,
    name,
    description,
    visibility,
    questionsJson: JSON.stringify(questions),
  }).returning()

  return { success: true, presetId: preset.id }
}

export async function saveDraft(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const draftId = formData.get('draftId') as string | null
  const name = (formData.get('name') as string)?.trim() || 'Untitled draft'
  const questionsJson = formData.get('questionsJson') as string

  if (draftId) {
    const existing = await db.query.presetDrafts.findFirst({
      where: eq(presetDrafts.id, draftId),
    })
    if (!existing || existing.createdBy !== session.user.id) return { error: 'Unauthorized' }

    await db.update(presetDrafts)
      .set({ name, questionsJson, updatedAt: new Date() })
      .where(eq(presetDrafts.id, draftId))

    return { success: true, draftId }
  }

  const [draft] = await db.insert(presetDrafts).values({
    createdBy: session.user.id,
    name,
    questionsJson,
  }).returning()

  return { success: true, draftId: draft.id }
}

export async function deleteDraft(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const draftId = formData.get('draftId') as string

  const existing = await db.query.presetDrafts.findFirst({
    where: eq(presetDrafts.id, draftId),
  })
  if (!existing || existing.createdBy !== session.user.id) return { error: 'Unauthorized' }

  await db.delete(presetDrafts).where(eq(presetDrafts.id, draftId))
  revalidatePath('/community')
  return { success: true }
}

export async function votePreset(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const presetId = formData.get('presetId') as string
  const voteValue = formData.get('voteValue') as 'up' | 'down'

  const preset = await db.query.communityPresets.findFirst({
    where: eq(communityPresets.id, presetId),
  })
  if (!preset) return { error: 'Preset not found' }
  if (preset.createdBy === session.user.id) return { error: 'You cannot vote on your own preset' }

  const existing = await db.query.presetVotes.findFirst({
    where: and(
      eq(presetVotes.presetId, presetId),
      eq(presetVotes.userId, session.user.id)
    ),
  })

  if (existing) {
    if (existing.voteValue === voteValue) {
      await db.delete(presetVotes).where(eq(presetVotes.id, existing.id))
    } else {
      await db.update(presetVotes).set({ voteValue }).where(eq(presetVotes.id, existing.id))
    }
  } else {
    await db.insert(presetVotes).values({ presetId, userId: session.user.id, voteValue })
  }

  revalidatePath('/community')
  return { success: true }
}

export async function toggleFollow(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const presetId = formData.get('presetId') as string

  const existing = await db.query.presetFollows.findFirst({
    where: and(
      eq(presetFollows.presetId, presetId),
      eq(presetFollows.userId, session.user.id)
    ),
  })

  if (existing) {
    await db.delete(presetFollows).where(eq(presetFollows.id, existing.id))
  } else {
    await db.insert(presetFollows).values({ presetId, userId: session.user.id })
  }

  revalidatePath('/community')
  return { success: true }
}

export async function importPresetJson(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const jsonString = formData.get('json') as string
  const visibility = formData.get('visibility') as 'public' | 'anonymised' | 'private'

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { error: 'Invalid JSON file' }
  }

  const fileSchema = z.object({
    name: z.string().min(1).max(100),
    questions: z.array(questionSchema).min(1).max(100),
  })

  const result = fileSchema.safeParse(parsed)
  if (!result.success) return { error: 'Invalid preset format: ' + result.error.issues[0].message }

  const [preset] = await db.insert(communityPresets).values({
    createdBy: session.user.id,
    name: result.data.name,
    description: '',
    visibility,
    questionsJson: JSON.stringify(result.data.questions),
  }).returning()

  return { success: true, presetId: preset.id }
}
export async function unpublishPreset(formData: FormData) {
  const session = await requireAdmin()
  if (!session) return { error: 'Unauthorized' }

  const presetId = formData.get('presetId') as string

  await db.update(communityPresets)
    .set({ isUnpublished: true })
    .where(eq(communityPresets.id, presetId))

  revalidatePath('/admin/dashboard/community')
  return { success: true }
}

export async function republishPreset(formData: FormData) {
  const session = await requireAdmin()
  if (!session) return { error: 'Unauthorized' }

  const presetId = formData.get('presetId') as string

  await db.update(communityPresets)
    .set({ isUnpublished: false })
    .where(eq(communityPresets.id, presetId))

  revalidatePath('/admin/dashboard/community')
  return { success: true }
}

export async function deleteCommunityPreset(formData: FormData) {
  const session = await requireAdmin()
  if (!session) return { error: 'Unauthorized' }

  const presetId = formData.get('presetId') as string

  await db.delete(presetVotes).where(eq(presetVotes.presetId, presetId))
  await db.delete(presetFollows).where(eq(presetFollows.presetId, presetId))
  await db.delete(communityPresets).where(eq(communityPresets.id, presetId))

  revalidatePath('/admin/dashboard/community')
  return { success: true }
}
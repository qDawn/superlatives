'use server'

import { db } from '@/server/db'
import { questionSets, questions } from '@/server/db/schema/questions'
import { rooms } from '@/server/db/schema/rooms'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const addQuestionSchema = z.object({
  roomId: z.string(),
  text: z.string().min(1).max(500),
  questionType: z.enum(['single_select', 'multi_select', 'group_combination']),
  maxSelections: z.number().min(1).max(20),
  isSkippable: z.boolean(),
  shuffleOptions: z.boolean(),
  allowMultipleGroupAnswers: z.boolean(),
  displayOrder: z.number(),
})

export async function addQuestion(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const parsed = addQuestionSchema.safeParse({
    roomId: formData.get('roomId'),
    text: formData.get('text'),
    questionType: formData.get('questionType'),
    maxSelections: Number(formData.get('maxSelections')),
    isSkippable: formData.get('isSkippable') === 'true',
    shuffleOptions: formData.get('shuffleOptions') === 'true',
    allowMultipleGroupAnswers: formData.get('allowMultipleGroupAnswers') === 'true',
    displayOrder: Number(formData.get('displayOrder')),
  })

  if (!parsed.success) return { error: 'Invalid input' }

  const { roomId, ...data } = parsed.data

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'draft') return { error: 'Room is locked' }

  let questionSet = await db.query.questionSets.findFirst({
    where: eq(questionSets.roomId, roomId),
  })

  if (!questionSet) {
    const [newSet] = await db.insert(questionSets).values({
      roomId,
      createdBy: session.user.id,
    }).returning()
    questionSet = newSet
  }

  const [question] = await db.insert(questions).values({
    questionSetId: questionSet.id,
    text: data.text,
    questionType: data.questionType,
    maxSelections: data.maxSelections,
    isSkippable: data.isSkippable,
    shuffleOptions: data.shuffleOptions,
    allowMultipleGroupAnswers: data.allowMultipleGroupAnswers,
    displayOrder: data.displayOrder,
  }).returning()

  return { question }
}
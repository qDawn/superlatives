'use server'

import { db } from '@/server/db'
import { questionSets, questions } from '@/server/db/schema/questions'
import { rooms } from '@/server/db/schema/rooms'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { questionSetExportSchema } from '@/lib/validators/question-set'


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

export async function exportQuestionSet(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }

  const questionSet = await db.query.questionSets.findFirst({
    where: eq(questionSets.roomId, roomId),
    with: {
      questions: {
        orderBy: (q, { asc }) => [asc(q.displayOrder)],
      },
    },
  })

  if (!questionSet) return { error: 'No question set found' }

  const exported = {
    version: 1 as const,
    name: room.name,
    shuffleQuestions: questionSet.shuffleQuestions,
    questions: questionSet.questions.map(q => ({
      text: q.text,
      questionType: q.questionType,
      maxSelections: q.maxSelections,
      displayOrder: q.displayOrder,
      isSkippable: q.isSkippable,
      shuffleOptions: q.shuffleOptions,
      allowMultipleGroupAnswers: q.allowMultipleGroupAnswers,
    })),
  }

  return { data: exported }
}

export async function importQuestionSet(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string
  const jsonString = formData.get('json') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'draft') return { error: 'Room is already open' }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { error: 'Invalid JSON file' }
  }

  const result = questionSetExportSchema.safeParse(parsed)
  if (!result.success) {
    return { error: 'Invalid question set format: ' + result.error.issues[0].message }
  }

  const data = result.data

  let questionSet = await db.query.questionSets.findFirst({
    where: eq(questionSets.roomId, roomId),
  })

  if (!questionSet) {
    const [newSet] = await db.insert(questionSets).values({
      roomId,
      createdBy: session.user.id,
      shuffleQuestions: data.shuffleQuestions,
    }).returning()
    questionSet = newSet
  }

  for (const q of data.questions) {
    await db.insert(questions).values({
      questionSetId: questionSet.id,
      text: q.text.trim().slice(0, 500),
      questionType: q.questionType,
      maxSelections: q.maxSelections,
      displayOrder: q.displayOrder,
      isSkippable: q.isSkippable,
      shuffleOptions: q.shuffleOptions,
      allowMultipleGroupAnswers: q.allowMultipleGroupAnswers,
    })
  }

  return { success: true, count: data.questions.length }
}
export async function deleteQuestion(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const questionId = formData.get('questionId') as string

  const question = await db.query.questions.findFirst({
    where: eq(questions.id, questionId),
    with: {
      questionSet: {
        with: { room: true },
      },
    },
  })

  if (!question) return { error: 'Not found' }
  if (question.questionSet.room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (question.questionSet.room.status !== 'draft') return { error: 'Room is locked' }

  await db.delete(questions).where(eq(questions.id, questionId))
  return { success: true }
}

export async function editQuestion(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const questionId = formData.get('questionId') as string
  const text = (formData.get('text') as string)?.trim()
  const maxSelections = Number(formData.get('maxSelections'))
  const isSkippable = formData.get('isSkippable') === 'true'
  const shuffleOptions = formData.get('shuffleOptions') === 'true'
  const allowMultipleGroupAnswers = formData.get('allowMultipleGroupAnswers') === 'true'

  if (!text) return { error: 'Text is required' }

  const question = await db.query.questions.findFirst({
    where: eq(questions.id, questionId),
    with: {
      questionSet: {
        with: { room: true },
      },
    },
  })

  if (!question) return { error: 'Not found' }
  if (question.questionSet.room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (question.questionSet.room.status !== 'draft') return { error: 'Room is locked' }

  await db.update(questions)
    .set({ text, maxSelections, isSkippable, shuffleOptions, allowMultipleGroupAnswers })
    .where(eq(questions.id, questionId))

  return { success: true }
}
export async function applyPreset(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string
  const questionsJson = formData.get('questionsJson') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'draft') return { error: 'Room is already open' }

  const parsed = JSON.parse(questionsJson)

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

  const existingCount = await db.query.questions.findMany({
    where: eq(questions.questionSetId, questionSet.id),
  })

  for (const q of parsed) {
    await db.insert(questions).values({
      questionSetId: questionSet.id,
      text: q.text.trim().slice(0, 500),
      questionType: q.questionType,
      maxSelections: q.maxSelections,
      displayOrder: existingCount.length + q.displayOrder,
      isSkippable: q.isSkippable,
      shuffleOptions: q.shuffleOptions,
      allowMultipleGroupAnswers: q.allowMultipleGroupAnswers,
    })
  }

  return { success: true, count: parsed.length }
}
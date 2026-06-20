import { z } from 'zod'

export const questionSchema = z.object({
  text: z.string().min(1).max(500),
  questionType: z.enum(['single_select', 'multi_select', 'group_combination']),
  maxSelections: z.number().min(1).max(20),
  displayOrder: z.number(),
  isSkippable: z.boolean(),
  shuffleOptions: z.boolean(),
  allowMultipleGroupAnswers: z.boolean(),
})

export const questionSetExportSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(100),
  shuffleQuestions: z.boolean(),
  questions: z.array(questionSchema).min(1).max(100),
})

export type QuestionSetExport = z.infer<typeof questionSetExportSchema>
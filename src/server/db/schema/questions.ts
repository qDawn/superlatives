import { pgTable, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'
import { rooms } from './rooms'

export const questionTypeEnum = pgEnum('question_type', [
  'single_select',
  'multi_select', 
  'group_combination'
])

export const questionSets = pgTable('question_sets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roomId: text('room_id').notNull().references(() => rooms.id),
  createdBy: text('created_by').notNull().references(() => user.id),
  isLocked: boolean('is_locked').notNull().default(false),
  shuffleQuestions: boolean('shuffle_questions').notNull().default(false),
  lockedAt: timestamp('locked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const questions = pgTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  questionSetId: text('question_set_id').notNull().references(() => questionSets.id),
  text: text('text').notNull(),
  displayOrder: integer('display_order').notNull(),
  questionType: questionTypeEnum('question_type').notNull().default('single_select'),
  maxSelections: integer('max_selections').notNull().default(1),
  allowMultipleGroupAnswers: boolean('allow_multiple_group_answers').notNull().default(false),
  isSkippable: boolean('is_skippable').notNull().default(false),
  shuffleOptions: boolean('shuffle_options').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const questionSetPresets = pgTable('question_set_presets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  createdBy: text('created_by').notNull().references(() => user.id),
  name: text('name').notNull(),
  isSystemPreset: boolean('is_system_preset').notNull().default(false),
  questionsJson: text('questions_json').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
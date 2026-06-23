import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { questions } from './questions'
import { roomMembers } from './rooms'
import { rooms } from './rooms'

export const nameListEntries = pgTable('name_list_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roomId: text('room_id').notNull(),
  memberId: text('member_id').references(() => roomMembers.id),
  displayName: text('display_name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const votes = pgTable('votes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  questionId: text('question_id').notNull().references(() => questions.id),
  voterMemberId: text('voter_member_id').notNull().references(() => roomMembers.id),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
})

export const voteSelections = pgTable('vote_selections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  voteId: text('vote_id').notNull().references(() => votes.id),
  nameEntryId: text('name_entry_id').notNull().references(() => nameListEntries.id),
  groupAnswerIndex: integer('group_answer_index'),
})

export const resultViews = pgTable('result_views', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id').notNull(),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
})
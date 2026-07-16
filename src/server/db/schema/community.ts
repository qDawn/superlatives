import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'

export const presetVisibilityEnum = pgEnum('preset_visibility', ['public', 'anonymised', 'private'])
export const voteValueEnum = pgEnum('vote_value', ['up', 'down'])

export const communityPresets = pgTable('community_presets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  createdBy: text('created_by').notNull().references(() => user.id),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  questionsJson: text('questions_json').notNull(),
  visibility: presetVisibilityEnum('visibility').notNull().default('public'),
  isUnpublished: boolean('is_unpublished').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const presetVotes = pgTable('preset_votes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  presetId: text('preset_id').notNull().references(() => communityPresets.id),
  userId: text('user_id').notNull().references(() => user.id),
  voteValue: voteValueEnum('vote_value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const presetFollows = pgTable('preset_follows', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  presetId: text('preset_id').notNull().references(() => communityPresets.id),
  userId: text('user_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const presetDrafts = pgTable('preset_drafts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  createdBy: text('created_by').notNull().references(() => user.id),
  name: text('name').notNull().default('Untitled draft'),
  questionsJson: text('questions_json').notNull().default('[]'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const adminAccessLogs = pgTable('admin_access_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => user.id),
  pathname: text('pathname').notNull(),
  accessedAt: timestamp('accessed_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
})
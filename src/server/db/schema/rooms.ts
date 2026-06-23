import { pgTable, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'

export const joinModeEnum = pgEnum('join_mode', ['auto', 'manual'])
export const roomStatusEnum = pgEnum('room_status', ['draft', 'open', 'closed'])

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  ownerId: text('owner_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  joinMode: joinModeEnum('join_mode').notNull().default('auto'),
  status: roomStatusEnum('status').notNull().default('draft'),
  votingClosedAt: timestamp('voting_closed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  ownerParticipates: boolean('owner_participates').notNull().default(false),
  joinLocked: boolean('join_locked').notNull().default(false),
  votingReopenedAt: timestamp('voting_reopened_at'),
})

export const memberStatusEnum = pgEnum('member_status', ['pending', 'approved', 'denied'])

export const roomMembers = pgTable('room_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id').notNull().references(() => user.id),
  displayName: text('display_name').notNull(),
  status: memberStatusEnum('status').notNull().default('pending'),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  approvedAt: timestamp('approved_at'),
  autoDeniedAt: timestamp('auto_denied_at'),
})
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'
import { rooms } from './rooms'


export const permissionBundles = pgTable('permission_bundles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  createdBy: text('created_by').notNull().references(() => user.id),
  name: text('name').notNull(),
  isSystemPreset: boolean('is_system_preset').notNull().default(false),
  canApproveMembers: boolean('can_approve_members').notNull().default(false),
  canCloseVoting: boolean('can_close_voting').notNull().default(false),
  canViewCompletionCount: boolean('can_view_completion_count').notNull().default(false),
  canManageQuestionSet: boolean('can_manage_question_set').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const coOwnerPermissions = pgTable('co_owner_permissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id').notNull().references(() => user.id),
  permissionBundleId: text('permission_bundle_id').notNull().references(() => permissionBundles.id),
  grantedAt: timestamp('granted_at').notNull().defaultNow(),
})

export const adminAccessLogs = pgTable('admin_access_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => user.id),
  pathname: text('pathname').notNull(),
  accessedAt: timestamp('accessed_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
})
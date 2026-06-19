import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const siteRoleEnum = pgEnum('site_role', ['user', 'super_admin'])

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: text('email_verified'),
  passwordHash: text('password_hash'),
  image: text('image'),
  siteRole: siteRoleEnum('site_role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
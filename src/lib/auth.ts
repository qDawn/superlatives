import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/server/db'
import * as schema from '@/server/db/schema/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
      })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
})

export type Session = typeof auth.$Infer.Session
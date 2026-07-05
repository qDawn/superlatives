import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/server/db'
import * as schema from '@/server/db/schema/auth'
import { sendPasswordResetEmail } from '@/lib/email'

// Only register the provider once its env vars are actually present, so
// local dev still works before you've set up a Google OAuth client.
const socialProviders: NonNullable<Parameters<typeof betterAuth>[0]['socialProviders']> = {}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }
}

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
  socialProviders,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
})

export type Session = typeof auth.$Infer.Session
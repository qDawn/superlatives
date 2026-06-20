import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { eq } from 'drizzle-orm'

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return null

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  })

  if (!dbUser || dbUser.siteRole !== 'super_admin') return null

  return session
}
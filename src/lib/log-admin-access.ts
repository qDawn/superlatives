import { db } from '@/server/db'
import { adminAccessLogs } from '@/server/db/schema/permissions'
import { headers } from 'next/headers'

export async function logAdminAccess(userId: string, pathname: string) {
  const h = await headers()
  const ip = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown'
  const userAgent = h.get('user-agent') ?? 'unknown'

  await db.insert(adminAccessLogs).values({
    userId,
    pathname,
    ipAddress: ip,
    userAgent,
  }).catch(err => console.error('Failed to log admin access:', err))
}
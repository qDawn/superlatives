import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { roomMembers, rooms } from '@/server/db/schema/rooms'
import { eq, and, lt } from 'drizzle-orm'
import { sendDeniedEmail } from '@/lib/email'
import { user } from '@/server/db/schema/auth'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const pendingMembers = await db.query.roomMembers.findMany({
    where: and(
      eq(roomMembers.status, 'pending'),
      lt(roomMembers.registeredAt, sevenDaysAgo)
    ),
    with: {
      room: true,
    },
  })

  let denied = 0

  for (const member of pendingMembers) {
    await db.update(roomMembers)
      .set({ status: 'denied', autoDeniedAt: new Date() })
      .where(eq(roomMembers.id, member.id))

    const memberUser = await db.query.user.findFirst({
      where: eq(user.id, member.userId),
    })

    if (memberUser) {
      await sendDeniedEmail({
        to: memberUser.email,
        displayName: member.displayName,
        roomName: member.room.name,
      }).catch(err => console.error('Failed to send denial email:', err))
    }

    denied++
  }

  return NextResponse.json({ denied })
}
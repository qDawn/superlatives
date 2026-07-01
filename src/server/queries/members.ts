import { db } from '@/server/db'
import { roomMembers } from '@/server/db/schema/rooms'
import { votes } from '@/server/db/schema/votes'
import { eq, and, inArray } from 'drizzle-orm'
import { coOwnerPermissions, permissionBundles } from '@/server/db/schema/permissions'
import { user } from '@/server/db/schema/auth'

export async function getCoOwners(roomId: string) {
  const rows = await db.query.coOwnerPermissions.findMany({
    where: eq(coOwnerPermissions.roomId, roomId),
    with: {
      user: true,
      permissionBundle: true,
    },
  })

  return rows.map(r => ({
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    bundleName: r.permissionBundle.name,
    canApproveMembers: r.permissionBundle.canApproveMembers,
    canCloseVoting: r.permissionBundle.canCloseVoting,
    canViewCompletionCount: r.permissionBundle.canViewCompletionCount,
    canManageQuestionSet: r.permissionBundle.canManageQuestionSet,
  }))
}

export async function getRoomMembers(roomId: string) {
  return db.query.roomMembers.findMany({
    where: eq(roomMembers.roomId, roomId),
    orderBy: (members, { asc }) => [asc(members.registeredAt)],
  })
}

export async function getCompletionCount(roomId: string) {
  const approved = await db.query.roomMembers.findMany({
    where: and(
      eq(roomMembers.roomId, roomId),
      eq(roomMembers.status, 'approved')
    ),
  })

  if (approved.length === 0) return { completed: 0, total: 0 }

  const memberIds = approved.map(m => m.id)

  const voted = await db
    .selectDistinct({ voterId: votes.voterMemberId })
    .from(votes)
    .where(inArray(votes.voterMemberId, memberIds))

  return { completed: voted.length, total: approved.length }
}
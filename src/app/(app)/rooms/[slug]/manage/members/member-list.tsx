'use client'

import { toast } from 'sonner'
import { approveMember, denyMember } from '@/server/actions/members'

type Member = {
  id: string
  displayName: string
  status: string
  registeredAt: Date
}

export default function MemberList({
  members,
  roomId,
  joinMode,
  roomStatus,
}: {
  members: Member[]
  roomId: string
  joinMode: string
  roomStatus: string
}) {
  const pending = members.filter(m => m.status === 'pending')
  const approved = members.filter(m => m.status === 'approved')

  async function handleApprove(memberId: string, name: string) {
    const fd = new FormData()
    fd.set('memberId', memberId)
    fd.set('roomId', roomId)
    await approveMember(fd)
    toast.success(`${name} approved`)
  }

  async function handleDeny(memberId: string, name: string) {
    const fd = new FormData()
    fd.set('memberId', memberId)
    fd.set('roomId', roomId)
    await denyMember(fd)
    toast.success(`${name} denied`)
  }

  return (
    <div className="space-y-6">
      {joinMode === 'manual' && pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Pending approval ({pending.length})</h2>
          {pending.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-md border px-4 py-3">
              <span className="text-sm">{m.displayName}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(m.id, m.displayName)}
                  className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(m.id, m.displayName)}
                  className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium">
          Approved members ({approved.length})
        </h2>
        {approved.length === 0 && (
          <p className="text-sm text-muted-foreground">No approved members yet.</p>
        )}
        {approved.map(m => (
          <div key={m.id} className="flex items-center justify-between rounded-md border px-4 py-3">
            <span className="text-sm">{m.displayName}</span>
            <span className="text-xs text-muted-foreground">Approved</span>
          </div>
        ))}
      </div>
    </div>
  )
}
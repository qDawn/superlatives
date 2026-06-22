'use client'

import { toast } from 'sonner'
import { approveMember, denyMember } from '@/server/actions/members'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'

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
      <AnimatePresence>
        {joinMode === 'manual' && pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-medium">
              Pending approval{' '}
              <Badge variant="outline" className="text-amber-600 border-amber-300 ml-1">
                {pending.length}
              </Badge>
            </h2>
            {pending.map(m => (
              <Card key={m.id}>
                <CardContent className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{m.displayName}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(m.id, m.displayName)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeny(m.id, m.displayName)}
                    >
                      Deny
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">
          Approved members{' '}
          <span className="text-muted-foreground font-normal">({approved.length})</span>
        </h2>
        {approved.length === 0 && (
          <p className="text-sm text-muted-foreground">No approved members yet.</p>
        )}
        <AnimatePresence>
          {approved.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm">{m.displayName}</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Approved
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
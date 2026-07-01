'use client'

import { useActionState } from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { inviteCoOwner, removeCoOwner } from '@/server/actions/co-owners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type CoOwner = {
  id: string
  name: string
  email: string
  bundleName: string
  canApproveMembers: boolean
  canCloseVoting: boolean
  canViewCompletionCount: boolean
  canManageQuestionSet: boolean
}

export default function CoOwnerManager({
  roomId,
  coOwners,
}: {
  roomId: string
  coOwners: CoOwner[]
}) {
  const [state, action, pending] = useActionState(inviteCoOwner, null)
  const [bundleKey, setBundleKey] = useState('moderator')

  useEffect(() => {
    if (state?.success) {
      toast.success(`${state.addedName} added as co-owner`)
      window.location.reload()
    }
    if (state?.error) toast.error(state.error)
  }, [state])

  async function handleRemove(coOwnerId: string) {
    const fd = new FormData()
    fd.set('coOwnerId', coOwnerId)
    fd.set('roomId', roomId)
    const result = await removeCoOwner(fd)
    if (result?.success) {
      toast.success('Co-owner removed')
      window.location.reload()
    } else if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <h2 className="text-sm font-medium">Add a co-owner</h2>
          <form action={action} className="space-y-3">
            <input type="hidden" name="roomId" value={roomId} />
            <div className="space-y-2">
              <Label htmlFor="email">Email of an existing user</Label>
              <Input id="email" name="email" type="email" required placeholder="they must already have an account" />
            </div>
            <div className="space-y-2">
              <Label>Permission level</Label>
              <input type="hidden" name="bundleKey" value={bundleKey} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBundleKey('moderator')}
                  className={`flex-1 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    bundleKey === 'moderator' ? 'border-primary bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <p className="font-medium">Moderator</p>
                  <p className="text-muted-foreground">Approve members, view completion count</p>
                </button>
                <button
                  type="button"
                  onClick={() => setBundleKey('co_host')}
                  className={`flex-1 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    bundleKey === 'co_host' ? 'border-primary bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <p className="font-medium">Co-host</p>
                  <p className="text-muted-foreground">Full access — approve, close voting, manage questions</p>
                </button>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Adding...' : 'Add co-owner'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Current co-owners ({coOwners.length})
        </h2>
        {coOwners.length === 0 && (
          <p className="text-sm text-muted-foreground">No co-owners yet.</p>
        )}
        {coOwners.map(co => (
          <Card key={co.id}>
            <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{co.name}</p>
                  <Badge variant="outline" className="text-xs">{co.bundleName}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{co.email}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleRemove(co.id)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
'use client'

import { toast } from 'sonner'
import { unpublishPreset, republishPreset, deleteCommunityPreset } from '@/server/actions/community'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type AdminPreset = {
  id: string
  name: string
  creatorName: string
  creatorEmail: string
  visibility: string
  isUnpublished: boolean
  upvotes: number
  downvotes: number
  createdAt: Date
}

export default function ModerationList({ presets }: { presets: AdminPreset[] }) {
  async function handleUnpublish(id: string) {
    const fd = new FormData()
    fd.set('presetId', id)
    const result = await unpublishPreset(fd)
    if (result?.success) {
      toast.success('Unpublished')
      window.location.reload()
    } else if (result?.error) {
      toast.error(result.error)
    }
  }

  async function handleRepublish(id: string) {
    const fd = new FormData()
    fd.set('presetId', id)
    const result = await republishPreset(fd)
    if (result?.success) {
      toast.success('Republished')
      window.location.reload()
    }
  }

  async function handleDelete(id: string) {
    const fd = new FormData()
    fd.set('presetId', id)
    const result = await deleteCommunityPreset(fd)
    if (result?.success) {
      toast.success('Deleted permanently')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-3">
      {presets.length === 0 && (
        <p className="text-sm text-muted-foreground">No public community presets yet.</p>
      )}
      {presets.map(p => (
        <Card key={p.id}>
          <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{p.name}</p>
                <Badge variant="outline" className="text-xs">{p.visibility}</Badge>
                {p.isUnpublished && <Badge variant="outline" className="text-xs">Unpublished</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {p.creatorName} · {p.creatorEmail} · {p.upvotes - p.downvotes} net votes
              </p>
            </div>
            <div className="flex gap-2">
              {p.isUnpublished ? (
                <Button size="sm" variant="outline" onClick={() => handleRepublish(p.id)}>Republish</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => handleUnpublish(p.id)}>Unpublish</Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
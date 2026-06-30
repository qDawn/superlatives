'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { votePreset, toggleFollow } from '@/server/actions/community'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

type Question = {
  text: string
  questionType: string
  maxSelections: number
  isSkippable: boolean
}

type Preset = {
  id: string
  name: string
  description: string
  questions: Question[]
  visibility: string
  creatorName: string
  upvotes: number
  downvotes: number
  score: number
  myVote: 'up' | 'down' | null
  isFollowing: boolean
  isOwn: boolean
  followerCount: number
}

type PrivatePreset = {
  id: string
  name: string
  description: string
  questions: Question[]
}

export default function CommunityList({
  presets,
  privatePresets,
  currentUserId,
}: {
  presets: Preset[]
  privatePresets: PrivatePreset[]
  currentUserId: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localPresets, setLocalPresets] = useState(presets)

  async function handleVote(presetId: string, value: 'up' | 'down') {
    const fd = new FormData()
    fd.set('presetId', presetId)
    fd.set('voteValue', value)
    const result = await votePreset(fd)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    setLocalPresets(prev => prev.map(p => {
      if (p.id !== presetId) return p
      const wasVote = p.myVote
      let upvotes = p.upvotes
      let downvotes = p.downvotes
      let myVote: 'up' | 'down' | null = value

      if (wasVote === value) {
        myVote = null
        if (value === 'up') upvotes--
        else downvotes--
      } else if (wasVote) {
        if (wasVote === 'up') upvotes--
        else downvotes--
        if (value === 'up') upvotes++
        else downvotes++
      } else {
        if (value === 'up') upvotes++
        else downvotes++
      }

      return { ...p, upvotes, downvotes, score: upvotes - downvotes, myVote }
    }))
  }

  async function handleFollow(presetId: string) {
    const fd = new FormData()
    fd.set('presetId', presetId)
    const result = await toggleFollow(fd)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    setLocalPresets(prev => prev.map(p =>
      p.id === presetId ? { ...p, isFollowing: !p.isFollowing, followerCount: p.followerCount + (p.isFollowing ? -1 : 1) } : p
    ))
    toast.success('Updated')
  }

  return (
    <div className="space-y-6">
      {privatePresets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your private presets</h2>
          {privatePresets.map(p => (
            <Card key={p.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.questions.length} questions · only visible to you</p>
                  </div>
                  <Badge variant="outline">Private</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Community presets ({localPresets.length})
        </h2>
        {localPresets.length === 0 && (
          <p className="text-sm text-muted-foreground">No community presets yet — be the first to publish one.</p>
        )}
        {localPresets.map((preset, idx) => (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleVote(preset.id, 'up')}
                      disabled={preset.isOwn}
                      className={`text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        preset.myVote === 'up' ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ▲
                    </button>
                    <span className="text-xs font-medium">{preset.score}</span>
                    <button
                      onClick={() => handleVote(preset.id, 'down')}
                      disabled={preset.isOwn}
                      className={`text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        preset.myVote === 'down' ? 'text-red-600' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-medium">{preset.name}</p>
                        {preset.description && (
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        )}
                      </div>
                      {!preset.isOwn && (
                        <Button
                          size="sm"
                          variant={preset.isFollowing ? 'default' : 'outline'}
                          onClick={() => handleFollow(preset.id)}
                        >
                          {preset.isFollowing ? '✓ Following' : 'Follow'}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>by {preset.isOwn ? 'you' : preset.creatorName}</span>
                      <span>·</span>
                      <span>{preset.questions.length} questions</span>
                      <span>·</span>
                      <span>{preset.followerCount} followers</span>
                      {preset.visibility === 'anonymised' && (
                        <Badge variant="outline" className="text-xs py-0">Anonymous</Badge>
                      )}
                    </div>

                    <button
                      onClick={() => setExpanded(expanded === preset.id ? null : preset.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expanded === preset.id ? 'Hide ▲' : 'Preview ▼'}
                    </button>

                    <AnimatePresence>
                      {expanded === preset.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          {preset.questions.map((q, i) => (
                            <p key={i} className="text-xs">{i + 1}. {q.text}</p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
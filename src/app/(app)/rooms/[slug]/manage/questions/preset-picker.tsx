'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { applyPreset } from '@/server/actions/questions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'

type Question = {
  text: string
  questionType: string
  maxSelections: number
  displayOrder: number
  isSkippable: boolean
  shuffleOptions: boolean
  allowMultipleGroupAnswers: boolean
}

type Preset = {
  name: string
  description: string
  questions: Question[]
}

export default function PresetPicker({
  roomId,
  roomStatus,
  presets,
}: {
  roomId: string
  roomStatus: string
  presets: Preset[]
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  if (roomStatus !== 'draft') return null

  async function handleApply(preset: Preset) {
    setLoading(preset.name)
    const fd = new FormData()
    fd.set('roomId', roomId)
    fd.set('questionsJson', JSON.stringify(preset.questions))
    const result = await applyPreset(null, fd)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Applied "${preset.name}" — ${result.count} questions added`)
      setTimeout(() => window.location.reload(), 800)
      setOpen(false)
    }
    setLoading(null)
  }

  return (
    <div className="space-y-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(prev => !prev)}
      >
        {open ? 'Hide presets ▲' : 'Start from a preset ▼'}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {presets.map((preset) => (
                <Card key={preset.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <CardTitle className="text-sm">{preset.name}</CardTitle>
                        <CardDescription className="text-xs">{preset.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {preset.questions.length} questions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button
                      onClick={() => setExpanded(expanded === preset.name ? null : preset.name)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expanded === preset.name ? 'Hide ▲' : 'Preview ▼'}
                    </button>

                    <AnimatePresence>
                      {expanded === preset.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          {preset.questions.map((q, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                              <div className="space-y-0.5">
                                <p>{q.text}</p>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-xs py-0">
                                    {q.questionType === 'single_select' && 'Single'}
                                    {q.questionType === 'multi_select' && `Multi · ${q.maxSelections}`}
                                    {q.questionType === 'group_combination' && `Group of ${q.maxSelections}`}
                                  </Badge>
                                  {q.isSkippable && <Badge variant="outline" className="text-xs py-0">Optional</Badge>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      size="sm"
                      disabled={loading === preset.name}
                      onClick={() => handleApply(preset)}
                    >
                      {loading === preset.name ? 'Applying...' : 'Use this preset'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
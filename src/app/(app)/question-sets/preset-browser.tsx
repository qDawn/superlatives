'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'

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

export default function PresetBrowser({ presets }: { presets: Preset[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function handleImport(preset: Preset) {
    const json = JSON.stringify({
      version: 1,
      name: preset.name,
      shuffleQuestions: false,
      questions: preset.questions,
    })
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${preset.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded "${preset.name}" — import it in your room's question builder`)
  }

  return (
    <div className="space-y-4">
      {presets.map((preset, idx) => (
        <motion.div
          key={preset.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{preset.name}</CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {preset.questions.length} questions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setExpanded(expanded === preset.name ? null : preset.name)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded === preset.name ? 'Hide questions ▲' : 'Preview questions ▼'}
              </button>

              <AnimatePresence>
                {expanded === preset.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {preset.questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                        <div className="space-y-0.5">
                          <p>{q.text}</p>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs py-0">
                              {q.questionType === 'single_select' && 'Single'}
                              {q.questionType === 'multi_select' && `Multi ·${q.maxSelections}`}
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

              <Button size="sm" variant="outline" onClick={() => handleImport(preset)}>
                Download to import
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
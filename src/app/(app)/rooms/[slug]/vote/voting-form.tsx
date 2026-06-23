'use client'

import { useState } from 'react'
import { submitVotes } from '@/server/actions/votes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'

type Question = {
  id: string
  text: string
  questionType: string
  maxSelections: number
  isSkippable: boolean
  shuffleOptions: boolean
  allowMultipleGroupAnswers: boolean
}

type NameEntry = {
  id: string
  displayName: string
}

export default function VotingForm({
  questions,
  memberId,
  roomSlug,
  roomId,
  nameList,
}: {
  questions: Question[]
  memberId: string
  roomSlug: string
  roomId: string
  nameList: NameEntry[]
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [groupPick, setGroupPick] = useState<Record<string, string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleSelection(questionId: string, nameId: string, max: number) {
    setAnswers(prev => {
      const current = prev[questionId] ?? []
      if (current.includes(nameId)) {
        return { ...prev, [questionId]: current.filter(id => id !== nameId) }
      }
      if (current.length >= max) {
        return { ...prev, [questionId]: [...current.slice(1), nameId] }
      }
      return { ...prev, [questionId]: [...current, nameId] }
    })
  }

  function toggleGroupPick(questionId: string, nameId: string, groupSize: number) {
    setGroupPick(prev => {
      const current = prev[questionId] ?? []
      if (current.includes(nameId)) {
        return { ...prev, [questionId]: current.filter(id => id !== nameId) }
      }
      if (current.length >= groupSize) return prev
      return { ...prev, [questionId]: [...current, nameId] }
    })
  }

  function confirmGroupAnswer(questionId: string, groupSize: number) {
    const picks = groupPick[questionId] ?? []
    if (picks.length !== groupSize) return
    const sorted = [...picks].sort()
    const key = sorted.join('|')
    setAnswers(prev => {
      const current = prev[questionId] ?? []
      if (current.includes(key)) return prev
      return { ...prev, [questionId]: [...current, key] }
    })
    setGroupPick(prev => ({ ...prev, [questionId]: [] }))
  }

  async function handleSubmit() {
    setError('')
    for (const q of questions) {
      if (!q.isSkippable && !answers[q.id]?.length) {
        setError(`Please answer: "${q.text}"`)
        return
      }
    }
    setLoading(true)
    const result = await submitVotes({ answers, memberId, roomId })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Votes submitted!</h1>
          <p className="text-sm text-muted-foreground">
            Results will be visible once the host closes voting.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your answers</h2>
          {questions.map(q => {
            const ans = answers[q.id] ?? []
            return (
              <Card key={q.id}>
                <CardContent className="py-3 space-y-1">
                  <p className="text-sm font-medium">{q.text}</p>
                  {ans.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  ) : q.questionType === 'group_combination' ? (
                    <div className="space-y-1">
                      {ans.map((key, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {key.split('|').map(id =>
                            nameList.find(n => n.id === id)?.displayName ?? id
                          ).join(' + ')}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {ans.map(id =>
                        nameList.find(n => n.id === id)?.displayName ?? id
                      ).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cast your votes</h1>

      {questions.map((q, idx) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1">
                <p className="font-medium text-sm">{q.text}</p>
                {q.isSkippable && (
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                )}
              </div>

              {q.questionType === 'group_combination' ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Pick {q.maxSelections} people to form a group, then confirm.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nameList.map(n => {
                      const picks = groupPick[q.id] ?? []
                      const selected = picks.includes(n.id)
                      return (
                        <button
                          key={n.id}
                          onClick={() => toggleGroupPick(q.id, n.id, q.maxSelections)}
                          className={`rounded-full border px-3 py-1 text-xs transition-all ${
                            selected
                              ? 'bg-primary text-primary-foreground border-primary scale-105'
                              : 'hover:bg-accent'
                          }`}
                        >
                          {n.displayName}
                        </button>
                      )
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => confirmGroupAnswer(q.id, q.maxSelections)}
                    disabled={(groupPick[q.id] ?? []).length !== q.maxSelections}
                  >
                    Confirm group ({(groupPick[q.id] ?? []).length}/{q.maxSelections} selected)
                  </Button>
                  <AnimatePresence>
                    {(answers[q.id] ?? []).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        <p className="text-xs text-muted-foreground">Confirmed answers:</p>
                        {(answers[q.id] ?? []).map((key, i) => (
                          <div key={i} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
                            <span>
                              {key.split('|').map(id =>
                                nameList.find(n => n.id === id)?.displayName ?? id
                              ).join(' + ')}
                            </span>
                            <button
                              onClick={() => setAnswers(prev => ({
                                ...prev,
                                [q.id]: (prev[q.id] ?? []).filter((_, j) => j !== i)
                              }))}
                              className="text-muted-foreground hover:text-destructive ml-2 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nameList.map(n => {
                    const selected = (answers[q.id] ?? []).includes(n.id)
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleSelection(q.id, n.id, q.maxSelections)}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          selected
                            ? 'bg-primary text-primary-foreground border-primary scale-105'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {n.displayName}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Submitting...' : 'Submit votes'}
      </Button>
    </div>
  )
}
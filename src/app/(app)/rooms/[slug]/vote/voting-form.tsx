'use client'

import { useState } from 'react'
import { submitVotes } from '@/server/actions/votes'

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
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-medium">Votes submitted!</h1>
        <p className="text-sm text-muted-foreground">
          Results will be visible once the host closes voting.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium">Cast your votes</h1>

      {questions.map(q => (
        <div key={q.id} className="space-y-3 rounded-lg border p-4">
          <p className="font-medium text-sm">{q.text}</p>
          {q.isSkippable && (
            <p className="text-xs text-muted-foreground">Optional</p>
          )}

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
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {n.displayName}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => confirmGroupAnswer(q.id, q.maxSelections)}
                disabled={(groupPick[q.id] ?? []).length !== q.maxSelections}
                className="rounded-md border px-3 py-1 text-xs hover:bg-accent disabled:opacity-40"
              >
                Confirm group ({(groupPick[q.id] ?? []).length}/{q.maxSelections} selected)
              </button>
              {(answers[q.id] ?? []).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Confirmed answers:</p>
                  {(answers[q.id] ?? []).map((key, i) => (
                    <div key={i} className="flex items-center justify-between rounded border px-3 py-1 text-xs">
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
                        className="text-muted-foreground hover:text-destructive ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nameList.map(n => {
                const selected = (answers[q.id] ?? []).includes(n.id)
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleSelection(q.id, n.id, q.maxSelections)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {n.displayName}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit votes'}
      </button>
    </div>
  )
}
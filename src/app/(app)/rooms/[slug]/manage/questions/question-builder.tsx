'use client'

import { useState } from 'react'
import { addQuestion } from '@/server/actions/questions'

type QuestionType = 'single_select' | 'multi_select' | 'group_combination'

type Question = {
  id: string
  text: string
  questionType: QuestionType
  maxSelections: number
  isSkippable: boolean
  shuffleOptions: boolean
  allowMultipleGroupAnswers: boolean
}

export default function QuestionBuilder({
  roomId,
  roomSlug,
}: {
  roomId: string
  roomSlug: string
}) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [text, setText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('single_select')
  const [maxSelections, setMaxSelections] = useState(1)
  const [isSkippable, setIsSkippable] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [allowMultipleGroupAnswers, setAllowMultipleGroupAnswers] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!text.trim()) return
    setLoading(true)

    const formData = new FormData()
    formData.set('roomId', roomId)
    formData.set('text', text)
    formData.set('questionType', questionType)
    formData.set('maxSelections', String(maxSelections))
    formData.set('isSkippable', String(isSkippable))
    formData.set('shuffleOptions', String(shuffleOptions))
    formData.set('allowMultipleGroupAnswers', String(allowMultipleGroupAnswers))
    formData.set('displayOrder', String(questions.length))

    const result = await addQuestion(formData)

    if (result?.question) {
      setQuestions(prev => [...prev, result.question])
      setText('')
      setQuestionType('single_select')
      setMaxSelections(1)
      setIsSkippable(false)
      setShuffleOptions(false)
      setAllowMultipleGroupAnswers(false)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Add a question</h2>

        <div className="space-y-1">
          <label className="text-sm">Question text</label>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. Most likely to be late to their own wedding"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Question type</label>
          <select
            value={questionType}
            onChange={e => {
              const val = e.target.value as QuestionType
              setQuestionType(val)
              if (val === 'single_select') setMaxSelections(1)
            }}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="single_select">Single select (pick 1)</option>
            <option value="multi_select">Multi select (pick many)</option>
            <option value="group_combination">Group / duo / trio</option>
          </select>
        </div>

        {questionType !== 'single_select' && (
          <div className="space-y-1">
            <label className="text-sm">
              {questionType === 'group_combination' ? 'Group size' : 'Max selections'}
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxSelections}
              onChange={e => setMaxSelections(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {questionType === 'group_combination' && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowMultipleGroupAnswers}
              onChange={e => setAllowMultipleGroupAnswers(e.target.checked)}
            />
            Allow participants to submit multiple group answers
          </label>
        )}

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSkippable}
              onChange={e => setIsSkippable(e.target.checked)}
            />
            Skippable
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={e => setShuffleOptions(e.target.checked)}
            />
            Shuffle name order
          </label>
        </div>

        <button
          onClick={handleAdd}
          disabled={loading || !text.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add question'}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Questions ({questions.length})</h2>
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-md border px-4 py-3 text-sm space-y-1">
              <p className="font-medium">{i + 1}. {q.text}</p>
              <p className="text-muted-foreground text-xs">
                {q.questionType === 'single_select' && 'Single select'}
                {q.questionType === 'multi_select' && `Multi select — max ${q.maxSelections}`}
                {q.questionType === 'group_combination' && `Group of ${q.maxSelections}`}
                {q.isSkippable && ' · Skippable'}
                {q.shuffleOptions && ' · Shuffled'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
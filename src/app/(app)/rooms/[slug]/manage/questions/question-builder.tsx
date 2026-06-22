'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { addQuestion, deleteQuestion, editQuestion } from '@/server/actions/questions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'

type QuestionType = 'single_select' | 'multi_select' | 'group_combination'

type Question = {
  id: string
  text: string
  questionType: string
  maxSelections: number
  isSkippable: boolean
  shuffleOptions: boolean
  allowMultipleGroupAnswers: boolean
  displayOrder: number
}

export default function QuestionBuilder({
  roomId,
  roomSlug,
  roomStatus,
  initialQuestions,
}: {
  roomId: string
  roomSlug: string
  roomStatus: string
  initialQuestions: Question[]
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [text, setText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('single_select')
  const [maxSelections, setMaxSelections] = useState(1)
  const [isSkippable, setIsSkippable] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [allowMultipleGroupAnswers, setAllowMultipleGroupAnswers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editMax, setEditMax] = useState(1)
  const [editSkippable, setEditSkippable] = useState(false)
  const [editShuffle, setEditShuffle] = useState(false)
  const [editMultiGroup, setEditMultiGroup] = useState(false)

  const isLocked = roomStatus !== 'draft'

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
      toast.success('Question added')
    } else if (result?.error) {
      toast.error(result.error)
    }

    setLoading(false)
  }

  async function handleDelete(questionId: string) {
    const fd = new FormData()
    fd.set('questionId', questionId)
    const result = await deleteQuestion(fd)
    if (result?.success) {
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      toast.success('Question deleted')
    } else if (result?.error) {
      toast.error(result.error)
    }
  }

  function startEdit(q: Question) {
    setEditingId(q.id)
    setEditText(q.text)
    setEditMax(q.maxSelections)
    setEditSkippable(q.isSkippable)
    setEditShuffle(q.shuffleOptions)
    setEditMultiGroup(q.allowMultipleGroupAnswers)
  }

  async function handleEdit(questionId: string) {
    const fd = new FormData()
    fd.set('questionId', questionId)
    fd.set('text', editText)
    fd.set('maxSelections', String(editMax))
    fd.set('isSkippable', String(editSkippable))
    fd.set('shuffleOptions', String(editShuffle))
    fd.set('allowMultipleGroupAnswers', String(editMultiGroup))

    const result = await editQuestion(fd)
    if (result?.success) {
      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, text: editText, maxSelections: editMax, isSkippable: editSkippable, shuffleOptions: editShuffle, allowMultipleGroupAnswers: editMultiGroup }
          : q
      ))
      setEditingId(null)
      toast.success('Question updated')
    } else if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      {!isLocked && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <h2 className="text-sm font-medium">Add a question</h2>

            <div className="space-y-2">
              <Label>Question text</Label>
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. Most likely to be late to their own wedding"
              />
            </div>

            <div className="space-y-2">
              <Label>Question type</Label>
              <select
                value={questionType}
                onChange={e => {
                  const val = e.target.value as QuestionType
                  setQuestionType(val)
                  if (val === 'single_select') setMaxSelections(1)
                }}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="single_select">Single select (pick 1)</option>
                <option value="multi_select">Multi select (pick many)</option>
                <option value="group_combination">Group / duo / trio</option>
              </select>
            </div>

            {questionType !== 'single_select' && (
              <div className="space-y-2">
                <Label>{questionType === 'group_combination' ? 'Group size' : 'Max selections'}</Label>
                <Input
                  type="number"
                  min={2}
                  max={20}
                  value={maxSelections}
                  onChange={e => setMaxSelections(Number(e.target.value))}
                />
              </div>
            )}

            <div className="flex gap-4 flex-wrap">
              {questionType === 'group_combination' && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMultipleGroupAnswers}
                    onChange={e => setAllowMultipleGroupAnswers(e.target.checked)}
                  />
                  Allow multiple group answers
                </label>
              )}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSkippable}
                  onChange={e => setIsSkippable(e.target.checked)}
                />
                Skippable
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={e => setShuffleOptions(e.target.checked)}
                />
                Shuffle name order
              </label>
            </div>

            <Button
              onClick={handleAdd}
              disabled={loading || !text.trim()}
              size="sm"
            >
              {loading ? 'Adding...' : 'Add question'}
            </Button>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">
            Questions{' '}
            <span className="text-muted-foreground font-normal">({questions.length})</span>
          </h2>
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="py-3">
                    {editingId === q.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                        />
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Max selections</Label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={editMax}
                            onChange={e => setEditMax(Number(e.target.value))}
                          />
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={editSkippable} onChange={e => setEditSkippable(e.target.checked)} />
                            Skippable
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={editShuffle} onChange={e => setEditShuffle(e.target.checked)} />
                            Shuffle
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={editMultiGroup} onChange={e => setEditMultiGroup(e.target.checked)} />
                            Multiple group answers
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(q.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <p className="text-sm font-medium">{i + 1}. {q.text}</p>
                          <div className="flex gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {q.questionType === 'single_select' && 'Single select'}
                              {q.questionType === 'multi_select' && `Multi select · max ${q.maxSelections}`}
                              {q.questionType === 'group_combination' && `Group of ${q.maxSelections}`}
                            </Badge>
                            {q.isSkippable && <Badge variant="outline" className="text-xs">Skippable</Badge>}
                            {q.shuffleOptions && <Badge variant="outline" className="text-xs">Shuffled</Badge>}
                          </div>
                        </div>
                        {!isLocked && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => startEdit(q)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(q.id)}>Delete</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
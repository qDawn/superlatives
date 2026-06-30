'use client'

import { useState, useRef } from 'react'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { publishPreset, saveDraft, deleteDraft, importPresetJson } from '@/server/actions/community'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'

type QuestionType = 'single_select' | 'multi_select' | 'group_combination'

type Question = {
  text: string
  questionType: QuestionType
  maxSelections: number
  displayOrder: number
  isSkippable: boolean
  shuffleOptions: boolean
  allowMultipleGroupAnswers: boolean
}

type Draft = {
  id: string
  name: string
  questions: Question[]
  updatedAt: Date
}

export default function PublishFlow({ drafts }: { drafts: Draft[] }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [visibility, setVisibility] = useState<'public' | 'anonymised' | 'private'>('public')

  const [qText, setQText] = useState('')
  const [qType, setQType] = useState<QuestionType>('single_select')
  const [qMax, setQMax] = useState(1)

  const [publishState, publishAction, publishPending] = useActionState(publishPreset, null)
  const [draftState, draftAction, draftPending] = useActionState(saveDraft, null)
  const [importState, importAction, importPending] = useActionState(importPresetJson, null)
  const fileRef = useRef<HTMLInputElement>(null)

  function startNew() {
    setActiveDraftId(null)
    setName('')
    setDescription('')
    setQuestions([])
    setView('editor')
  }

  function loadDraft(draft: Draft) {
    setActiveDraftId(draft.id)
    setName(draft.name)
    setQuestions(draft.questions)
    setView('editor')
  }

  function addQuestion() {
    if (!qText.trim()) return
    setQuestions(prev => [...prev, {
      text: qText,
      questionType: qType,
      maxSelections: qMax,
      displayOrder: prev.length,
      isSkippable: false,
      shuffleOptions: true,
      allowMultipleGroupAnswers: false,
    }])
    setQText('')
    setQType('single_select')
    setQMax(1)
  }

  function removeQuestion(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSaveDraft() {
    if (!name.trim()) {
      toast.error('Give your preset a name first')
      return
    }
    const fd = new FormData()
    if (activeDraftId) fd.set('draftId', activeDraftId)
    fd.set('name', name)
    fd.set('questionsJson', JSON.stringify(questions))
    const result = await saveDraft(null, fd)
    if (result?.success) {
      toast.success('Draft saved')
      setActiveDraftId(result.draftId ?? null)
    } else if (result?.error) {
      toast.error(result.error)
    }
  }

  async function handlePublish() {
    if (!name.trim()) {
      toast.error('Give your preset a name first')
      return
    }
    if (questions.length === 0) {
      toast.error('Add at least one question')
      return
    }
    const fd = new FormData()
    fd.set('name', name)
    fd.set('description', description)
    fd.set('visibility', visibility)
    fd.set('questionsJson', JSON.stringify(questions))
    const result = await publishPreset(null, fd)
    if (result?.success) {
      toast.success('Preset published')
      setOpen(false)
      setView('list')
      window.location.reload()
    } else if (result?.error) {
      toast.error(result.error)
    }
  }

  async function handleDeleteDraft(draftId: string) {
    const fd = new FormData()
    fd.set('draftId', draftId)
    const result = await deleteDraft(fd)
    if (result?.success) {
      toast.success('Draft deleted')
      window.location.reload()
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const fd = new FormData()
    fd.set('json', text)
    fd.set('visibility', visibility)
    const result = await importPresetJson(null, fd)
    if (result?.success) {
      toast.success('Imported and published')
      window.location.reload()
    } else if (result?.error) {
      toast.error(result.error)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!open) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { setOpen(true); setView('list') }}>
          Create preset
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card>
        <CardContent className="pt-4 space-y-4">
          {view === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Drafts and import</h2>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={startNew}>Start from scratch</Button>
                <label>
                  <Button size="sm" variant="outline" type="button" disabled={importPending} onClick={() => fileRef.current?.click()}>
                    {importPending ? 'Importing...' : 'Import JSON'}
                  </Button>
                  <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
              </div>

              {drafts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Your drafts</p>
                  {drafts.map(d => (
                    <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <button onClick={() => loadDraft(d)} className="text-left hover:underline">
                        {d.name} <span className="text-xs text-muted-foreground">({d.questions.length} questions)</span>
                      </button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteDraft(d.id)}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'editor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{activeDraftId ? 'Editing draft' : 'New preset'}</h2>
                <Button size="sm" variant="ghost" onClick={() => setView('list')}>← Back</Button>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Friend Group Classics" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="One line about this set" maxLength={300} />
              </div>

              <div className="rounded-md border p-3 space-y-3">
                <Label className="text-xs">Add a question</Label>
                <Input value={qText} onChange={e => setQText(e.target.value)} placeholder="Question text" />
                <div className="flex gap-2">
                  <select
                    value={qType}
                    onChange={e => setQType(e.target.value as QuestionType)}
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-xs"
                  >
                    <option value="single_select">Single select</option>
                    <option value="multi_select">Multi select</option>
                    <option value="group_combination">Group/duo</option>
                  </select>
                  {qType !== 'single_select' && (
                    <Input
                      type="number"
                      min={2}
                      max={20}
                      value={qMax}
                      onChange={e => setQMax(Number(e.target.value))}
                      className="w-20"
                    />
                  )}
                  <Button size="sm" onClick={addQuestion}>Add</Button>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="space-y-1.5">
                  {questions.map((q, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
                      <span>{i + 1}. {q.text}</span>
                      <button onClick={() => removeQuestion(i)} className="text-muted-foreground hover:text-destructive">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Visibility when published</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['public', 'anonymised', 'private'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${
                        visibility === v ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {visibility === 'public' && 'Your name is shown alongside this preset.'}
                  {visibility === 'anonymised' && 'Your name is hidden from everyone except the site admin.'}
                  {visibility === 'private' && 'Only you can see this — not listed publicly, no voting or following.'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSaveDraft}>Save as draft</Button>
                <Button size="sm" onClick={handlePublish}>Publish</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
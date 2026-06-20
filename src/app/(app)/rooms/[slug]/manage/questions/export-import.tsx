'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { exportQuestionSet, importQuestionSet } from '@/server/actions/questions'

export default function ExportImport({
  roomId,
  roomStatus,
}: {
  roomId: string
  roomStatus: string
}) {
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const fd = new FormData()
    fd.set('roomId', roomId)
    const result = await exportQuestionSet(fd)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    if (result?.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `question-set-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Question set exported')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)

    const text = await file.text()
    const fd = new FormData()
    fd.set('roomId', roomId)
    fd.set('json', text)

    const result = await importQuestionSet(fd)
    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success(`Imported ${result.count} questions`)
      setTimeout(() => window.location.reload(), 800)
    }

    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (roomStatus !== 'draft') return null

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleExport}
        className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
      >
        Export JSON
      </button>
      <label className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent cursor-pointer">
        {importing ? 'Importing...' : 'Import JSON'}
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
          disabled={importing}
        />
      </label>
    </div>
  )
}
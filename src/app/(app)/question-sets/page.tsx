import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import presets from '../../../../public/seed/question-set-presets.json'
import PresetBrowser from './preset-browser'

export default async function QuestionSetsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Question set presets</h1>
        <p className="text-sm text-muted-foreground">
          Browse and import ready-made question sets into your room.
        </p>
      </div>
      <PresetBrowser presets={presets} />
    </main>
  )
}
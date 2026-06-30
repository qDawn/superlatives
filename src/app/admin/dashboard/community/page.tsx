import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/is-admin'
import { getAllCommunityPresetsForAdmin } from '@/server/queries/community'
import ModerationList from './moderation-list'
import Link from 'next/link'

export default async function AdminCommunityPage() {
  const session = await requireAdmin()
  if (!session) redirect('/dashboard')

  const presets = await getAllCommunityPresetsForAdmin()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <Link href="/admin/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to admin
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Community preset moderation</h1>
        <p className="text-sm text-muted-foreground">
          Unpublish or delete any public or anonymised community preset.
        </p>
      </div>
      <ModerationList presets={presets} />
    </div>
  )
}
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getCommunityPresets, getMyPrivatePresets, getMyDrafts } from '@/server/queries/community'
import CommunityList from './community-list'
import PublishFlow from './publish-flow'

export default async function CommunityPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const presets = await getCommunityPresets(session.user.id)
  const privatePresets = await getMyPrivatePresets(session.user.id)
  const drafts = await getMyDrafts(session.user.id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Community presets</h1>
          <p className="text-sm text-muted-foreground">
            Question sets shared by other users. Upvote, follow, or build your own.
          </p>
        </div>
        <PublishFlow drafts={drafts} />
      </div>

      <CommunityList
        presets={presets}
        privatePresets={privatePresets}
        currentUserId={session.user.id}
      />
    </main>
  )
}
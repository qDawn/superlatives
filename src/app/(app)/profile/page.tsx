import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ProfileForms from './profile-forms'

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings.</p>
      </div>
      <ProfileForms
        currentName={session.user.name}
        currentEmail={session.user.email}
      />
    </main>
  )
}
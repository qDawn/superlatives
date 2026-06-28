import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ProfileForms from './profile-forms'
import AvatarUpload from './avatar-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile picture</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentImage={session.user.image ?? null}
            name={session.user.name}
          />
        </CardContent>
      </Card>

      <ProfileForms
        currentName={session.user.name}
        currentEmail={session.user.email}
      />
    </main>
  )
}
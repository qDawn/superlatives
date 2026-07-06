'use client'

import { useActionState } from 'react'
import { updateDisplayName, updateEmail, updatePassword } from '@/server/actions/profile'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { deleteAccount } from '@/server/actions/profile'
import { useRouter } from 'next/navigation'

export default function ProfileForms({
  currentName,
  currentEmail,
}: {
  currentName: string
  currentEmail: string
}) {
  const [nameState, nameAction, namePending] = useActionState(updateDisplayName, null)
  const [emailState, emailAction, emailPending] = useActionState(updateEmail, null)
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, null)
  const router = useRouter()
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (deleteState?.success) {
      router.push('/')
    }
    if (deleteState?.error) toast.error(deleteState.error)
  }, [deleteState])

  useEffect(() => {
    if (nameState?.success) toast.success('Display name updated')
    if (nameState?.error) toast.error(nameState.error)
  }, [nameState])

  useEffect(() => {
    if (emailState?.success) toast.success(emailState.message ?? 'Email update initiated')
    if (emailState?.error) toast.error(emailState.error)
  }, [emailState])

  useEffect(() => {
    if (passwordState?.success) toast.success('Password updated')
    if (passwordState?.error) toast.error(passwordState.error)
  }, [passwordState])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display name</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={nameAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={currentName}
                maxLength={50}
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={namePending}>
              {namePending ? 'Saving...' : 'Save name'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email address</CardTitle>
          <CardDescription>
            Current: {currentEmail}. A verification email will be sent to your new address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={emailAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">New email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="New email address"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={emailPending}>
              {emailPending ? 'Sending...' : 'Change email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <Button type="submit" size="sm" disabled={passwordPending}>
              {passwordPending ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
          </Card>
          <Card>
      <CardHeader>
        <CardTitle className="text-base text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently delete your account and all your data. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirming(true)}
          >
            Delete my account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              This will delete all your rooms, votes, and data permanently.
            </p>
            <div className="flex gap-2">
              <form action={deleteAction}>
                <Button type="submit" size="sm" variant="destructive" disabled={deletePending}>
                  {deletePending ? 'Deleting...' : 'Yes, delete everything'}
                </Button>
              </form>
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  )
}
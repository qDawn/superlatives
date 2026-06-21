'use client'

import { useActionState } from 'react'
import { updateDisplayName, updateEmail, updatePassword } from '@/server/actions/profile'
import { toast } from 'sonner'
import { useEffect } from 'react'

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
    <div className="space-y-8">
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-medium">Display name</h2>
        <form action={nameAction} className="space-y-3">
          <input
            name="name"
            type="text"
            defaultValue={currentName}
            maxLength={50}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={namePending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {namePending ? 'Saving...' : 'Save name'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-medium">Email address</h2>
        <p className="text-xs text-muted-foreground">
          Current: {currentEmail}. A verification email will be sent to your new address.
        </p>
        <form action={emailAction} className="space-y-3">
          <input
            name="email"
            type="email"
            placeholder="New email address"
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={emailPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {emailPending ? 'Sending...' : 'Change email'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-medium">Change password</h2>
        <form action={passwordAction} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Current password</label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">New password</label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Confirm new password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {passwordPending ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
'use server'

import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateDisplayName(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const name = (formData.get('name') as string)?.trim()
  if (!name || name.length < 1 || name.length > 50) {
    return { error: 'Name must be between 1 and 50 characters' }
  }

  await db.update(user)
    .set({ name })
    .where(eq(user.id, session.user.id))

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEmail(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email || !email.includes('@')) return { error: 'Invalid email' }

  await auth.api.changeEmail({
    body: { newEmail: email, callbackURL: '/profile' },
    headers: await headers(),
  })

  return { success: true, message: 'Verification email sent to your new address' }
}

export async function updatePassword(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: await headers(),
    })
    return { success: true }
  } catch {
    return { error: 'Current password is incorrect' }
  }
}
'use server'

import { db } from '@/server/db'
import { rooms } from '@/server/db/schema/rooms'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  joinMode: z.enum(['auto', 'manual']),
})

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Math.random().toString(36).slice(2, 7)
}

export async function createRoom(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const parsed = createRoomSchema.safeParse({
    name: formData.get('name'),
    joinMode: formData.get('joinMode'),
  })

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  const { name, joinMode } = parsed.data
  const slug = slugify(name)

  const [room] = await db.insert(rooms).values({
    ownerId: session.user.id,
    name,
    slug,
    joinMode,
    status: 'draft',
  }).returning()

  redirect(`/rooms/${room.slug}/manage/questions`)
}
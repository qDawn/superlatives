'use client'

import { useActionState } from 'react'
import { createRoom } from '@/server/actions/rooms'

export default function NewRoomPage() {
  const [state, action, pending] = useActionState(createRoom, null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Create a room</h1>
          <p className="text-sm text-muted-foreground">
            Set up your superlatives game.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Room name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Office Party 2026"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="joinMode" className="text-sm font-medium">
              Who can join?
            </label>
            <select
              id="joinMode"
              name="joinMode"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="auto">Anyone with the link</option>
              <option value="manual">Requires my approval</option>
            </select>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? 'Creating...' : 'Create room'}
          </button>
        </form>
      </div>
    </main>
  )
}
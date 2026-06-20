'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'
import { useState } from 'react'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (!session) return null

  return (
    <header className="border-b">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-medium text-sm">
            Superlatives
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              href="/dashboard"
              className={pathname === '/dashboard' ? 'text-foreground' : 'hover:text-foreground'}
            >
              Dashboard
            </Link>
            <Link
              href="/rooms/new"
              className={pathname === '/rooms/new' ? 'text-foreground' : 'hover:text-foreground'}
            >
              New room
            </Link>
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{session.user.name}</span>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>

        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="sm:hidden text-muted-foreground hover:text-foreground p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t px-4 py-3 space-y-3 text-sm">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="block text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/rooms/new"
            onClick={() => setMenuOpen(false)}
            className="block text-muted-foreground hover:text-foreground"
          >
            New room
          </Link>
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="text-muted-foreground">{session.user.name}</span>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
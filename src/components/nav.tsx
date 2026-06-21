'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <div className="h-7 w-7 rounded-full bg-secondary border flex items-center justify-center text-xs font-medium">
                {session.user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span>{session.user.name}</span>
              <span className="text-xs">▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-10 w-52 rounded-lg border bg-background shadow-sm z-50">
                <div className="px-3 py-2 border-b">
                  <p className="text-xs font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-accent"
                  >
                    Settings
                  </Link>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <div className="flex rounded-md border overflow-hidden text-xs">
                      {(['light', 'system', 'dark'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-2 py-1 capitalize transition-colors ${
                            theme === t
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
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
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="block text-muted-foreground hover:text-foreground"
          >
            Settings
          </Link>
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Theme</span>
              <div className="flex rounded-md border overflow-hidden text-xs">
                {(['light', 'system', 'dark'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-2 py-1 capitalize transition-colors ${
                      theme === t
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{session.user.name}</span>
              <button
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive/80"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
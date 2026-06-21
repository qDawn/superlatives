'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Theme</span>
      <div className="flex rounded-md border overflow-hidden text-xs">
        {['light', 'system', 'dark'].map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-3 py-1.5 capitalize transition-colors ${
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
  )
}
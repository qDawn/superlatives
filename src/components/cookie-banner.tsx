'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('cookie-notice-dismissed')
    if (!dismissed) setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem('cookie-notice-dismissed', 'true')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50"
        >
          <div className="rounded-lg border bg-popover shadow-md p-4 space-y-3">
            <p className="text-sm">
              We use one essential cookie to keep you signed in. No tracking or advertising cookies.{' '}
              <Link href="/about" className="underline underline-offset-4">Learn more</Link>
            </p>
            <Button size="sm" onClick={dismiss} className="w-full">
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
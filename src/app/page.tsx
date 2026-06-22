'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-semibold tracking-tight"
          >
            Superlatives
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            The party game where everyone votes — and nobody knows who picked who.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex gap-3 justify-center"
        >
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
            Get started
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
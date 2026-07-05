'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { buttonVariants } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L21 7.5V16.5L12 22L3 16.5V7.5L12 2Z" stroke="var(--primary)" strokeWidth="1.6" />
      <path d="M12 8L16 10.3V14.7L12 17L8 14.7V10.3L12 8Z" fill="var(--primary)" />
    </svg>
  )
}

const steps = [
  {
    num: '01',
    title: 'Build the ballot',
    body: 'Write your own questions or pull a ready-made set from the community.',
  },
  {
    num: '02',
    title: 'Everyone votes',
    body: 'Friends join with a code and vote privately — no one sees who picked who.',
  },
  {
    num: '03',
    title: 'Reveal together',
    body: 'Watch results roll in live, in person or thrown up on a stream.',
  },
]

const previewBars = [
  { name: 'Amara', pct: 78 },
  { name: 'Jonah', pct: 46 },
  { name: 'Priya', pct: 31 },
]

export default function Home() {
  return (
    <main>
      <header className="flex items-center justify-between px-6 sm:px-11 h-16 border-b">
        <div className="flex items-center gap-2 font-heading font-semibold text-[15px]">
          <LogoMark className="size-[22px]" />
          Superlatives
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
            Get started
          </Link>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-14 items-center px-6 sm:px-11 pt-16 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-5">
            Party game, built for real friend groups
          </span>
          <h1 className="font-heading text-4xl sm:text-[2.75rem] leading-[1.12] font-semibold tracking-tight mb-5">
            Everyone votes. Nobody knows who picked who.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-8">
            Create a room, drop in your own questions or a community preset, and let the group crown its superlatives anonymously — then reveal the results together.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
              Create a room
            </Link>
            <Link href="#how-it-works" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              See how it works
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            Votes stay private until everyone's in
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-muted-foreground">Most likely to move abroad</span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">14 votes</span>
            </div>
            <div className="space-y-3.5">
              {previewBars.map((bar, i) => (
                <div key={bar.name} className="flex items-center gap-3">
                  <span className="text-sm w-16 shrink-0">{bar.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{bar.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="how-it-works" className="px-6 sm:px-11 pb-24 pt-4">
        <div className="text-center max-w-lg mx-auto mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            How a room comes together
          </h2>
          <p className="text-muted-foreground">
            Three steps, no app download, no explaining the rules twice.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
              className="rounded-xl border bg-card p-6"
            >
              <span className="font-heading text-sm font-semibold text-primary block mb-3.5">
                {step.num}
              </span>
              <h3 className="font-medium mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
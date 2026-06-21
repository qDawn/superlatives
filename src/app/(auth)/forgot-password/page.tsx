'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>
              {sent
                ? `We sent a reset link to ${email} if an account exists.`
                : "Enter your email and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>
          {!sent && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    ← Back to login
                  </Link>
                </div>
              </form>
            </CardContent>
          )}
          {sent && (
            <CardContent>
              <div className="text-center">
                <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to login
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </main>
  )
}
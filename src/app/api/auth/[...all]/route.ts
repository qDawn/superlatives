import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { NextRequest, NextResponse } from 'next/server'
import { authRatelimit } from '@/lib/rate-limit'

const handler = toNextJsHandler(auth)

async function rateLimitedHandler(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await authRatelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  return handler.POST(req)
}

export const GET = handler.GET
export const POST = rateLimitedHandler
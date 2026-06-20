import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-medium">404</h1>
      <p className="text-sm text-muted-foreground">This page doesn't exist.</p>
      <Link
        href="/dashboard"
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
      >
        Back to dashboard
      </Link>
    </main>
  )
}
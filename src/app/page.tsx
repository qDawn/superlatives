import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-medium">Superlatives</h1>
      <p className="text-muted-foreground">A party game for everyone.</p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Sign up
        </Link>
      </div>
    </main>
  )
}
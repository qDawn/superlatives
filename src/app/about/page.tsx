import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">About Superlatives</h1>
        <p className="text-sm text-muted-foreground">
          A party game for groups of friends, colleagues, and teams.
        </p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-base font-medium">What is this?</h2>
        <p>
          Superlatives is a web app where hosts create rooms with superlative-style
          questions — "most likely to be late to their own wedding," "best duo," and so on.
          Participants join, vote anonymously, and results are revealed when the host
          closes voting.
        </p>

        <h2 className="text-base font-medium">Privacy</h2>
        <p>
          Voting is anonymous to other participants. No one in the room can see who
          voted for whom — only the aggregate results are shown when voting closes.
        </p>
        <p>
          However, there is one important disclosure: this site is operated by a single
          super-admin account. The admin dashboard shows anonymised vote data with
          participants labelled as Participant A, Participant B, and so on — real names
          are not shown in the interface. That said, as the site operator, the admin has
          direct access to the underlying database and could technically cross-reference
          anonymised labels with real account data. This is a known limitation of any
          centrally hosted service.
        </p>
        <p>
          If you have concerns about this, do not submit votes you would not want the
          site operator to potentially see.
        </p>

        <h2 className="text-base font-medium">Data we store</h2>
        <p>
          We store your email address, display name, and the votes you submit.
          Votes are stored indefinitely so participants can revisit their answers.
          We do not sell your data or share it with third parties.
        </p>

        <h2 className="text-base font-medium">Cookies</h2>
        <p>
          We use a single session cookie to keep you logged in. No tracking or
          advertising cookies are used.
        </p>

        <h2 className="text-base font-medium">Contact</h2>
        <p>
          This is an independent project. For any questions or concerns, contact
          the site operator directly.
        </p>
      </div>

      <div className="pt-4 border-t">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to dashboard
        </Link>
      </div>
    </main>
  )
}
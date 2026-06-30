import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-base font-medium">Acceptance of terms</h2>
        <p>
          By creating an account or using Superlatives, you agree to these terms.
          This is an independent project provided as-is, without warranty of any kind.
        </p>

        <h2 className="text-base font-medium">Accounts</h2>
        <p>
          You are responsible for keeping your account credentials secure.
          You must provide a valid email address. You may not create accounts
          for the purpose of abuse, impersonation, or circumventing room access controls.
        </p>

        <h2 className="text-base font-medium">Acceptable use</h2>
        <p>
          Question and answer content must not include illegal content, harassment,
          hate speech, or content that violates the rights of others. Room owners
          are responsible for the question sets they create and publish, including
          to the community presets section. We reserve the right to remove content
          or suspend accounts that violate this.
        </p>

        <h2 className="text-base font-medium">Community presets</h2>
        <p>
          By publishing a preset publicly or anonymously, you grant other users
          the right to view, use, and import that question set into their own rooms.
          You retain no exclusive rights over published content. The super-admin
          may unpublish or delete community presets at their discretion.
        </p>

        <h2 className="text-base font-medium">Data and privacy</h2>
        <p>
          See our <Link href="/about" className="underline underline-offset-4">about and privacy page</Link> for
          details on what data we collect and how it is used.
        </p>

        <h2 className="text-base font-medium">Termination</h2>
        <p>
          We reserve the right to suspend or delete accounts that violate these terms.
          You may stop using the service at any time.
        </p>

        <h2 className="text-base font-medium">Changes</h2>
        <p>
          These terms may be updated as the service evolves. Continued use after
          changes constitutes acceptance of the new terms.
        </p>

        <h2 className="text-base font-medium">Contact</h2>
        <p>
          This is an independent project. For questions, contact the site operator directly.
        </p>
      </div>

      <div className="pt-4 border-t">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  )
}
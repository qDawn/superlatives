import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { ThemeProvider } from '@/components/theme-provider'
import CookieBanner from '@/components/cookie-banner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Superlatives',
  description: 'A party game for everyone',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Nav />
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t px-4 py-6 text-xs text-muted-foreground">
          <div className="mx-auto max-w-4xl flex items-center justify-between flex-wrap gap-2">
            <span>Superlatives</span>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About & Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>
          <Toaster position="bottom-right" richColors />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
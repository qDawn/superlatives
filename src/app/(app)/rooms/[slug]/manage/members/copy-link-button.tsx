'use client'

import { toast } from 'sonner'

export default function CopyLinkButton({ url }: { url: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(url)
    toast.success('Join link copied')
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
    >
      Copy link
    </button>
  )
}
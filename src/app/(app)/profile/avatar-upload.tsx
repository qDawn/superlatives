'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function AvatarUpload({
  currentImage,
  name,
}: {
  currentImage: string | null
  name: string
}) {
  const [preview, setPreview] = useState<string | null>(currentImage)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (data.error) {
      toast.error(data.error)
      setPreview(currentImage)
    } else {
      toast.success('Profile picture updated')
      router.refresh()
    }

    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={preview ?? undefined} alt={name} />
        <AvatarFallback className="text-xl">
          {name?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <label className="cursor-pointer">
          <Button
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            {uploading ? 'Uploading...' : 'Change photo'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
      </div>
    </div>
  )
}
'use client'

import Image from 'next/image'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MouseEvent } from 'react'

interface ProtectedImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  onDownload?: () => void
}

export function ProtectedImage({ src, alt, className, sizes, onDownload }: ProtectedImageProps) {
  const handleDownload = async (e: MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click events
    
    if (onDownload) {
      onDownload()
      return
    }

    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  return (
    <div
      className="relative group select-none w-full h-full overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="w-full h-full transition-transform duration-500 group-hover:scale-105 relative">
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${className || ''}`}
          style={{ objectFit: 'cover' }}
          sizes={sizes}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:flex">
          <div className="pointer-events-auto">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ProtectedImage } from '@/components/dashboard/protected-image'
import { ImageDetailModal } from '@/components/dashboard/image-detail-modal'
import { useState } from 'react'

interface GeneratedImage {
  id: string
  imageUrl: string | null
  originalImageUrl: string | null
  prompt: string
  createdAt: string
}

interface ImageGridProps {
  images: GeneratedImage[]
}

export function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  return (
    <>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Create New Card */}
        <Link href="/dashboard/create" className="block h-full">
          <Card className="bg-muted/30 border-dashed hover:bg-muted/50 hover:border-primary/50 transition-colors h-full min-h-full flex flex-col items-center justify-center text-center cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-muted-foreground h-full">
              <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-medium">Create another image</p>
            </CardContent>
          </Card>
        </Link>

        {images.map((gen) => (
          <Card 
            key={gen.id} 
            className="p-0 overflow-hidden group border-muted/60 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => setSelectedImage(gen)}
          >
            <CardContent className="p-0">
              {gen.imageUrl ? (
                <div className="relative aspect-square w-full">
                  <ProtectedImage
                    src={gen.imageUrl}
                    alt="Generated image"
                    className=""
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-muted flex items-center justify-center text-muted-foreground">
                  Image unavailable
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ImageDetailModal 
        image={selectedImage} 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </>
  )
}

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface GeneratedImage {
  id: string
  imageUrl: string | null
  originalImageUrl: string | null
  prompt: string
  createdAt: string
}

interface ImageDetailModalProps {
  image: GeneratedImage | null
  isOpen: boolean
  onClose: () => void
}

export function ImageDetailModal({ image, isOpen, onClose }: ImageDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // 0 = generated, 1 = original
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const router = useRouter()

  // Determine which images are available
  const images = image && image.imageUrl ? [
    { url: image.imageUrl, label: 'Generated' },
    ...(image.originalImageUrl ? [{ url: image.originalImageUrl, label: 'Original' }] : [])
  ] : []

  // Reset image index when image changes or when available images change
  useEffect(() => {
    if (currentImageIndex >= images.length && images.length > 0) {
      setCurrentImageIndex(0)
    }
  }, [image?.id, images.length, currentImageIndex])

  // Reset state when image changes or modal opens/closes
  useEffect(() => {
    if (isOpen && image) {
      setShowDeleteConfirm(false)
      setIsDeleting(false)
      setCurrentImageIndex(0)
      setTouchStart(null)
      setTouchEnd(null)
    }
  }, [image, isOpen])

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  if (!image || !image.imageUrl) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl!)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${image.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded')
    } catch {
      toast.error('Failed to download image')
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/generations/${image.id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }
      
      toast.success('Image deleted successfully')
      setShowDeleteConfirm(false)
      setIsDeleting(false)
      onClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image')
      setIsDeleting(false)
    }
  }

  // Reset confirmation state and image index when modal closes
  const handleClose = () => {
    setShowDeleteConfirm(false)
    setIsDeleting(false)
    setCurrentImageIndex(0)
    setTouchStart(null)
    setTouchEnd(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-full md:max-w-[90vw] w-full p-0 overflow-hidden bg-background md:bg-background/95 backdrop-blur-sm h-[85vh] md:h-[85vh] max-h-[85vh] md:max-h-[85vh] !flex flex-col md:flex-row !gap-0 !fixed !inset-x-0 !bottom-0 !top-auto md:!top-[50%] md:!left-[50%] md:!bottom-auto md:!right-auto !translate-x-0 !translate-y-0 md:!translate-x-[-50%] md:!translate-y-[-50%] !rounded-b-none rounded-t-2xl md:!rounded-lg md:border border-l-0 md:border-l border-r-0 md:border-r border-b-0 md:border-b border-t md:border-t data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95"
        showCloseButton={false}
      >
        {/* Image Section - Always visible, fixed height on mobile */}
        <div 
          className="relative flex items-center justify-center h-[50vh] md:h-full md:flex-1 overflow-hidden bg-zinc-950"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Mobile: Close button with semi-transparent circle overlay */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="md:hidden absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 shadow-lg"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>

          {/* Desktop: Arrow navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous image</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentImageIndex === images.length - 1}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next image</span>
              </Button>
            </>
          )}

          {/* Image indicator dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
          <div 
            className="flex w-full h-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)`, width: images.length > 1 ? `${images.length * 100}%` : '100%' }}
          >
            {images.map((img, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover md:w-auto md:h-full md:max-h-full md:object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="w-full md:w-80 md:min-w-80 md:border-l p-6 flex flex-col gap-4 bg-background overflow-hidden flex-shrink-0 min-h-0 relative">
          {/* Desktop: Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hidden md:flex absolute top-4 right-4 z-20 h-8 w-8 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          
          <DialogHeader className="p-0 space-y-0 flex-shrink-0 pr-8">
            <DialogTitle className="hidden md:block text-xl md:text-2xl font-bold">Image Details</DialogTitle>
            <DialogDescription className="sr-only">
              View and manage generated image details
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pb-32 md:pb-0">
            {/* Created date - always visible */}
            <div className="flex-shrink-0">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Created at</h4>
              <p className="text-sm">{new Date(image.createdAt).toLocaleDateString()} at {new Date(image.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Mobile: Fixed buttons at bottom */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex flex-col gap-3 z-30">
            {!showDeleteConfirm ? (
              <>
                <Button onClick={handleDownload} size="lg" className="w-full gap-2 font-semibold">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  onClick={handleDeleteClick} 
                  variant="outline" 
                  size="lg"
                  className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Are you sure you want to delete this image? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDeleteCancel}
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDeleteConfirm}
                    variant="destructive" 
                    size="lg"
                    className="flex-1 gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Buttons in sidebar */}
          <div className="hidden md:flex flex-col gap-3 pt-4 border-t flex-shrink-0">
            {!showDeleteConfirm ? (
              <>
                <Button onClick={handleDownload} size="lg" className="w-full gap-2 font-semibold">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  onClick={handleDeleteClick} 
                  variant="outline" 
                  size="lg"
                  className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Are you sure you want to delete this image? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDeleteCancel}
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDeleteConfirm}
                    variant="destructive" 
                    size="lg"
                    className="flex-1 gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

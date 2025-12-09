'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Download, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ProtectedImage } from '@/components/dashboard/protected-image'
import { ImageDetailModal } from '@/components/dashboard/image-detail-modal'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { GeneratedImage, BulkActions } from '@/types/dashboard'

interface ImageGridProps {
  images: GeneratedImage[]
  isSelectionMode: boolean
  onSelectionModeChange: (enabled: boolean) => void
  onSelectionCountChange?: (count: number) => void
  onBulkActionsReady?: (actions: BulkActions | null) => void
}

export function ImageGrid({ images, isSelectionMode, onSelectionModeChange, onSelectionCountChange, onBulkActionsReady }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  // Clear selection when exiting selection mode
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds(new Set())
    }
  }, [isSelectionMode])

  // Update selection count
  useEffect(() => {
    onSelectionCountChange?.(selectedIds.size)
  }, [selectedIds.size, onSelectionCountChange])

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === images.length) {
        return new Set()
      } else {
        return new Set(images.map(img => img.id))
      }
    })
  }, [images])

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedIds.size === 0) return
    setShowDeleteDialog(true)
  }, [selectedIds.size])

  const handleBulkDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      const idsToDelete = Array.from(selectedIds)
      const res = await fetch('/api/generations/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete images')
      }

      const result = await res.json()
      toast.success(`Successfully deleted ${result.deleted} image${result.deleted > 1 ? 's' : ''}`)
      setSelectedIds(new Set())
      setShowDeleteDialog(false)
      onSelectionModeChange(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete images'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedIds, onSelectionModeChange, router])

  const handleBulkDownload = useCallback(async () => {
    if (selectedIds.size === 0) return

    setIsDownloading(true)
    try {
      const selectedImages = images.filter(img => selectedIds.has(img.id) && img.imageUrl)
      
      for (const img of selectedImages) {
        try {
          const response = await fetch(img.imageUrl!)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `generated-image-${img.id}.png`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          // Small delay between downloads to avoid browser blocking
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          // Silently continue with other downloads if one fails
        }
      }

      toast.success(`Downloaded ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}`)
      setSelectedIds(new Set())
      onSelectionModeChange(false)
    } catch (error) {
      toast.error('Failed to download images')
    } finally {
      setIsDownloading(false)
    }
  }, [selectedIds, images, onSelectionModeChange])

  // Provide bulk actions to parent
  useEffect(() => {
    if (isSelectionMode && onBulkActionsReady) {
      onBulkActionsReady({
        onClear: () => setSelectedIds(new Set()),
        onDownload: handleBulkDownload,
        onDelete: handleBulkDeleteClick,
        onSelectAll: toggleSelectAll,
        isAllSelected: selectedIds.size === images.length && images.length > 0,
        isDeleting,
        isDownloading,
      })
    } else if (!isSelectionMode && onBulkActionsReady) {
      onBulkActionsReady(null)
    }
  }, [isSelectionMode, selectedIds.size, images.length, isDeleting, isDownloading, onBulkActionsReady, handleBulkDownload, handleBulkDeleteClick, toggleSelectAll])

  const handleCardClick = (gen: GeneratedImage, event: React.MouseEvent) => {
    // Don't open modal if clicking checkbox or if in selection mode
    const target = event.target as HTMLElement
    if (target.closest('[role="checkbox"]') || target.closest('button')) {
      return
    }
    
    // If in selection mode, toggle selection instead of opening modal
    if (isSelectionMode) {
      toggleSelection(gen.id)
    } else {
      setSelectedImage(gen)
    }
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete images?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} image{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full min-w-0">
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

        {images.map((gen) => {
          const isSelected = selectedIds.has(gen.id)
          return (
            <Card 
              key={gen.id} 
              className={`p-0 overflow-hidden group border-muted/60 hover:border-primary/50 transition-all cursor-pointer relative ${
                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={(e) => handleCardClick(gen, e)}
            >
              {/* Checkbox overlay - only show in selection mode */}
              {isSelectionMode && (
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(gen.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background/90 backdrop-blur-sm !rounded-full !size-6 sm:!size-8 [&>svg]:!size-4 sm:[&>svg]:!size-6"
                  />
                </div>
              )}

              <CardContent className="p-0">
                {gen.imageUrl ? (
                  <div className="relative aspect-square w-full">
                    <ProtectedImage
                      src={gen.imageUrl}
                      alt="Generated image"
                      className={isSelected ? 'opacity-75' : ''}
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
          )
        })}
      </div>

      <ImageDetailModal 
        image={selectedImage} 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Plus, CheckSquare, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyState } from './empty-state'
import { ImageGrid } from './image-grid'

interface GeneratedImage {
  id: string
  imageUrl: string
  originalImageUrl: string | null
  prompt: string
  createdAt: string
}

interface DashboardContentProps {
  images: GeneratedImage[]
}

export function DashboardContent({ images }: DashboardContentProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [bulkActions, setBulkActions] = useState<{
    onClear: () => void
    onDownload: () => void
    onDelete: () => void
    onSelectAll: () => void
    isAllSelected: boolean
    isDeleting: boolean
    isDownloading: boolean
  } | null>(null)

  return (
    <div className="flex flex-col gap-8 w-full min-w-0">
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate flex-shrink min-w-0">My products</h1>
          {images.length > 0 && !isSelectionMode && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsSelectionMode(true)}
                className="gap-2"
                size="sm"
              >
                <CheckSquare className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Select</span>
              </Button>
              <Link href="/dashboard/create">
                <Button className="gap-2" size="sm">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">New image</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {isSelectionMode && images.length > 0 && (
          <div className="flex flex-col gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg border w-full min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {selectedCount} selected
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {bulkActions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkActions.onSelectAll}
                    className="gap-1 sm:gap-2"
                  >
                    <CheckSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{bulkActions.isAllSelected ? 'Deselect all' : 'Select all'}</span>
                    <span className="sm:hidden">{bulkActions.isAllSelected ? 'Deselect' : 'All'}</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsSelectionMode(false)}
                  className="gap-1 sm:gap-2 text-muted-foreground"
                  size="sm"
                >
                  <span className="hidden sm:inline">Cancel selection</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
              </div>
            </div>
            
            {selectedCount > 0 && bulkActions && (
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={bulkActions.onClear}
                  className="h-9 text-muted-foreground min-w-0"
                >
                  <span className="truncate">Clear</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkActions.onDownload}
                  disabled={bulkActions.isDownloading}
                  className="gap-1 sm:gap-2 h-9 min-w-0"
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Download</span>
                  <span className="sm:hidden truncate">Down</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkActions.onDelete}
                  disabled={bulkActions.isDeleting}
                  className="gap-1 sm:gap-2 h-9 min-w-0"
                >
                  <Trash2 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Delete</span>
                  <span className="sm:hidden truncate">Del</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <EmptyState />
      ) : (
        <ImageGrid 
          images={images} 
          isSelectionMode={isSelectionMode}
          onSelectionModeChange={setIsSelectionMode}
          onSelectionCountChange={setSelectedCount}
          onBulkActionsReady={setBulkActions}
        />
      )}
    </div>
  )
}

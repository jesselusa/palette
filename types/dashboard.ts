export interface GeneratedImage {
  id: string
  imageUrl: string | null
  originalImageUrl: string | null
  prompt: string
  createdAt: string
}

export interface BulkActions {
  onClear: () => void
  onDownload: () => void
  onDelete: () => void
  onSelectAll: () => void
  isAllSelected: boolean
  isDeleting: boolean
  isDownloading: boolean
}

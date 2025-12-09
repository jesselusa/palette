'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Loader2, Minimize2, X } from 'lucide-react'
import { GenerationProgress } from '@/hooks/use-generation-progress'
import { motion, AnimatePresence } from 'framer-motion'

interface GenerationProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  progress: GenerationProgress | null
  isGenerating: boolean
  showCancelConfirm: boolean
  onCancelConfirm: (confirmed: boolean) => void
}

export function GenerationProgressModal({
  isOpen,
  onClose,
  onMinimize,
  progress,
  isGenerating,
  showCancelConfirm,
  onCancelConfirm,
}: GenerationProgressModalProps) {
  const getProgressPercentage = () => {
    if (!progress) return 0
    if (progress.step === 'analyzing') return 10
    if (progress.step === 'generating' && progress.image && progress.total) {
      // 10% for analyzing + 90% for generation split across images
      return 10 + (progress.image / progress.total) * 90
    }
    if (progress.step === 'complete') return 100
    return 0
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open && !showCancelConfirm) {
        onMinimize() // When closing, minimize instead of fully closing
      }
    }}>
      <SheetContent side="right" className="w-full sm:max-w-md" showCloseButton={false}>
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle>
            {showCancelConfirm ? 'Cancel generation?' : 'Generating images'}
          </SheetTitle>
          {!showCancelConfirm && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                className="h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SheetHeader>

        <div className="space-y-4">
          {showCancelConfirm ? (
            <>
              <p className="text-sm text-muted-foreground">
                This will stop the current generation process. Any progress will be lost.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onCancelConfirm(false)}
                >
                  Continue generating
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onCancelConfirm(true)}
                >
                  Cancel generation
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Progress Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {isGenerating && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  <p className="text-sm font-medium">
                    {progress?.message || 'Starting generation...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>

                {/* Image Progress */}
                {progress?.step === 'generating' && progress.image && progress.total && (
                  <p className="text-xs text-muted-foreground text-center">
                    Image {progress.image} of {progress.total}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You can minimize this window and continue browsing. We'll notify you when it's ready.
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

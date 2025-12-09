'use client'

import { Button } from '@/components/ui/button'
import { Loader2, X, Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GenerationProgress } from '@/hooks/use-generation-progress'

interface ProgressWidgetProps {
  isGenerating: boolean
  progress: GenerationProgress | null
  isOpen: boolean
  isMinimized: boolean
  onOpen: () => void
  onClose: () => void
  onMinimize: () => void
  showCancelConfirm: boolean
  onCancelConfirm: (confirmed: boolean) => void
}

export function ProgressWidget({
  isGenerating,
  progress,
  isOpen,
  isMinimized,
  onOpen,
  onClose,
  onMinimize,
  showCancelConfirm,
  onCancelConfirm,
}: ProgressWidgetProps) {

  const getProgressPercentage = () => {
    if (!progress) return 0
    if (progress.step === 'analyzing') return 10
    if (progress.step === 'generating' && progress.image && progress.total) {
      return 10 + (progress.image / progress.total) * 90
    }
    if (progress.step === 'complete') return 100
    return 0
  }

  if (!isGenerating && !isOpen && !isMinimized) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-background border rounded-lg shadow-lg w-[calc(100vw-2rem)] max-w-80 p-4 space-y-4 pointer-events-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {showCancelConfirm ? 'Cancel generation?' : 'Generating images'}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMinimize}
                  className="h-6 w-6"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {showCancelConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This will stop the current generation process. Any progress will be lost.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancelConfirm(false)}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelConfirm(true)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isGenerating && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  <p className="text-sm font-medium">
                    {progress?.message || 'Starting generation...'}
                  </p>
                </div>

                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>

                {progress?.step === 'generating' && progress.image && progress.total && (
                  <p className="text-xs text-muted-foreground text-center">
                    Image {progress.image} of {progress.total}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized button */}
      {isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative pointer-events-auto"
        >
          <Button
            onClick={onOpen}
            className="h-12 w-12 rounded-full shadow-lg"
            size="icon"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Loader2 className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

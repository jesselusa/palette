'use client'

import { useGeneration } from '@/contexts/generation-context'
import { ProgressWidget } from './progress-widget'

export function GlobalProgressWidget() {
  const {
    isGenerating,
    progress,
    progressWidgetOpen,
    progressWidgetMinimized,
    showCancelConfirm,
    cancel,
    setProgressWidgetOpen,
    setProgressWidgetMinimized,
    setShowCancelConfirm,
  } = useGeneration()

  return (
    <ProgressWidget
      isGenerating={isGenerating}
      progress={progress}
      isOpen={progressWidgetOpen}
      isMinimized={progressWidgetMinimized}
      onOpen={() => {
        setProgressWidgetOpen(true)
        setProgressWidgetMinimized(false)
      }}
      onClose={() => {
        if (isGenerating) {
          setShowCancelConfirm(true)
        } else {
          setProgressWidgetOpen(false)
        }
      }}
      onMinimize={() => {
        setProgressWidgetOpen(false)
        setProgressWidgetMinimized(true)
      }}
      showCancelConfirm={showCancelConfirm}
      onCancelConfirm={(confirmed) => {
        if (confirmed) {
          cancel()
          setProgressWidgetOpen(false)
          setProgressWidgetMinimized(false)
          setShowCancelConfirm(false)
        } else {
          setShowCancelConfirm(false)
        }
      }}
    />
  )
}

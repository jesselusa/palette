'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

export interface GenerationProgress {
  step: 'analyzing' | 'generating' | 'complete' | 'error'
  message: string
  image?: number
  total?: number
}

export interface GenerationResult {
  images: Array<{
    id: string
    imageUrl: string | null
    prompt: string
    createdAt: string
  }>
  usedFreeTrial: boolean
  creditsRemaining: number
  freeTrialUsed: number
}

interface FormState {
  file: File | null
  filePreview: string | null
  prompt: string
  quality: string
  quantity: number[]
}

interface GenerationContextType {
  isGenerating: boolean
  progress: GenerationProgress | null
  result: GenerationResult | null
  error: string | null
  progressWidgetOpen: boolean
  progressWidgetMinimized: boolean
  showCancelConfirm: boolean
  formState: FormState | null
  startGeneration: (formData: FormData) => Promise<void>
  cancel: () => void
  setProgressWidgetOpen: (open: boolean) => void
  setProgressWidgetMinimized: (minimized: boolean) => void
  setShowCancelConfirm: (show: boolean) => void
  setFormState: (state: FormState | null) => void
  openResultsModal: () => void
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined)

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progressWidgetOpen, setProgressWidgetOpen] = useState(false)
  const [progressWidgetMinimized, setProgressWidgetMinimized] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [formState, setFormState] = useState<FormState | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const openResultsModal = useCallback(() => {
    if (result && result.images.length > 0) {
      window.dispatchEvent(new CustomEvent('openResultsModal', { detail: result }))
    }
  }, [result])

  const startGeneration = useCallback(async (formData: FormData) => {
    setIsGenerating(true)
    setProgress(null)
    setResult(null)
    setError(null)
    setProgressWidgetOpen(true)
    setProgressWidgetMinimized(false)

    // Create abort controller for cancellation
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim()
            continue
          }

          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim()
            if (!dataStr) continue

            try {
              const data = JSON.parse(dataStr)

              if (currentEvent === 'error' || data.error) {
                setError(data.error || 'An error occurred')
                setIsGenerating(false)
                setProgressWidgetOpen(false)
                return
              }

              if (currentEvent === 'progress') {
                if (data.step === 'analyzing' || data.step === 'generating') {
                  setProgress({
                    step: data.step,
                    message: data.message,
                    image: data.image,
                    total: data.total,
                  })
                }
              }

              if (currentEvent === 'complete' && data.images) {
                setResult({
                  images: data.images,
                  usedFreeTrial: data.usedFreeTrial,
                  creditsRemaining: data.creditsRemaining,
                  freeTrialUsed: data.freeTrialUsed,
                })
                setIsGenerating(false)
                setProgress({ step: 'complete', message: 'Complete!' })
                // Close widget when generation completes
                setProgressWidgetOpen(false)
                setProgressWidgetMinimized(false)
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e, dataStr)
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsGenerating(false)
        setProgress(null)
        setProgressWidgetOpen(false)
        return
      }
      setError(err.message || 'Generation failed')
      setIsGenerating(false)
      setProgressWidgetOpen(false)
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
    setProgress(null)
    setProgressWidgetOpen(false)
    setProgressWidgetMinimized(false)
    setShowCancelConfirm(false)
  }, [])

  // Listen for generation complete events to create notifications
  useEffect(() => {
    const handleGenerationComplete = async () => {
      if (result && result.images.length > 0) {
        try {
          const firstImageUrl = result.images[0]?.imageUrl || null
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'generation_complete',
              title: `Generated ${result.images.length} image${result.images.length > 1 ? 's' : ''}`,
              message: `Your image${result.images.length > 1 ? 's' : ''} ${result.images.length > 1 ? 'are' : 'is'} ready to view.`,
              image_url: firstImageUrl,
            }),
          })
          window.dispatchEvent(new CustomEvent('generationComplete', { detail: result }))
        } catch (error) {
          console.error('Error creating notification:', error)
        }
      }
    }
    handleGenerationComplete()
  }, [result])

  return (
    <GenerationContext.Provider
      value={{
        isGenerating,
        progress,
        result,
        error,
        progressWidgetOpen,
        progressWidgetMinimized,
        showCancelConfirm,
        formState,
        startGeneration,
        cancel,
        setProgressWidgetOpen,
        setProgressWidgetMinimized,
        setShowCancelConfirm,
        setFormState,
        openResultsModal,
      }}
    >
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const context = useContext(GenerationContext)
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider')
  }
  return context
}

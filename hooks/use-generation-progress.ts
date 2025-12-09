import { useState, useEffect, useRef, useCallback } from 'react'

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

export function useGenerationProgress() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const startGeneration = useCallback(async (formData: FormData) => {
    setIsGenerating(true)
    setProgress(null)
    setResult(null)
    setError(null)

    // Create EventSource for SSE
    const eventSource = new EventSource('/api/generate', {
      // Note: EventSource doesn't support POST, so we'll use fetch with ReadableStream
    })

    // Use fetch with ReadableStream instead
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
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
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e, dataStr)
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      setIsGenerating(false)
    }
  }, [])

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsGenerating(false)
    setProgress(null)
  }, [])

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    isGenerating,
    progress,
    result,
    error,
    startGeneration,
    cancel,
  }
}

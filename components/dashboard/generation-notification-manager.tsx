'use client'

import { useState, useEffect } from 'react'
import { GenerationNotification } from './generation-notification'
import { useRouter } from 'next/navigation'

export function GenerationNotificationManager() {
  const [completedCount, setCompletedCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const handleGenerationComplete = () => {
      setCompletedCount((prev) => prev + 1)
    }

    const handleResultsViewed = () => {
      setCompletedCount((prev) => Math.max(0, prev - 1))
    }

    window.addEventListener('generationComplete', handleGenerationComplete)
    window.addEventListener('resultsViewed', handleResultsViewed)

    return () => {
      window.removeEventListener('generationComplete', handleGenerationComplete)
      window.removeEventListener('resultsViewed', handleResultsViewed)
    }
  }, [])

  const handleClick = () => {
    // Dispatch event to reopen progress modal/drawer
    window.dispatchEvent(new CustomEvent('openProgressModal'))
    // Navigate to create page where generation is happening
    router.push('/dashboard/create')
  }

  return (
    <GenerationNotification 
      activeCount={completedCount} 
      onClick={handleClick}
    />
  )
}

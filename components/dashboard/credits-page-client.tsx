'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PaymentSuccessAnimation } from './payment-success-animation'

export function CreditsPageClient() {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      setShowSuccess(true)
    }
  }, [searchParams])

  return (
    <PaymentSuccessAnimation 
      show={showSuccess} 
      onComplete={() => setShowSuccess(false)}
    />
  )
}

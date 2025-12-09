'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function CreditsPurchaseButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for cancel messages from Stripe redirect (success is handled by animation component)
  useEffect(() => {
    const canceled = searchParams.get('canceled')

    if (canceled === 'true') {
      toast.error('Payment canceled. No credits were added.')
      router.replace('/dashboard/credits')
    }
  }, [searchParams, router])

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <Button 
      size="lg" 
      className="w-full" 
      onClick={handlePurchase}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Buy 10 credits for $9.99'
      )}
    </Button>
  )
}

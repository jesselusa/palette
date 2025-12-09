'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function CreditsDisplay() {
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)
  const [freeTrialUsed, setFreeTrialUsed] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchCredits = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Error getting user:', userError)
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_balance, free_trial_images_used')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setLoading(false)
        return
      }

      if (profile) {
        setCreditsBalance(profile.credits_balance ?? 0)
        setFreeTrialUsed(profile.free_trial_images_used ?? 0)
      } else {
        console.warn('No profile found for user:', user.id)
        setCreditsBalance(0)
        setFreeTrialUsed(0)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCredits()

    // Listen for custom event to refresh credits
    const handleCreditsUpdate = () => {
      fetchCredits()
    }

    window.addEventListener('creditsUpdated', handleCreditsUpdate)
    return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate)
  }, [fetchCredits])

  if (loading || creditsBalance === null || freeTrialUsed === null) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-muted/50">
        <span className="text-sm font-medium">...</span>
      </div>
    )
  }

  const freeTrialRemaining = Math.max(0, 3 - freeTrialUsed)
  const isZeroCredits = creditsBalance === 0 && freeTrialRemaining === 0

  return (
    <Link href="/dashboard/credits" className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
      {freeTrialRemaining > 0 ? (
        <span className="text-sm font-medium">
          {freeTrialRemaining} free trial image{freeTrialRemaining > 1 ? 's' : ''}
        </span>
      ) : isZeroCredits ? (
        <>
          {/* Desktop: Show both */}
          <span className="text-sm font-medium hidden sm:inline">
            {creditsBalance} credits
          </span>
          <span className="text-xs text-primary font-medium hidden sm:inline">
            Buy credits
          </span>
          {/* Mobile: Just show Buy credits */}
          <span className="text-sm font-medium sm:hidden">
            Buy credits
          </span>
        </>
      ) : (
        <span className="text-sm font-medium">
          {creditsBalance} credit{creditsBalance !== 1 ? 's' : ''}
        </span>
      )}
    </Link>
  )
}

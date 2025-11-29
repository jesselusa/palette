'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Handles OAuth redirects that land on the root page instead of /auth/callback
 * This can happen if Supabase redirects to the Site URL instead of the redirectTo URL
 */
export function OAuthRedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    // If we have an OAuth code or error on the root page, redirect to the callback handler
    if (code || error) {
      const params = new URLSearchParams()
      if (code) params.set('code', code)
      if (error) {
        params.set('error', error)
        const errorDescription = searchParams.get('error_description')
        if (errorDescription) params.set('error_description', errorDescription)
      }
      
      router.replace(`/auth/callback?${params.toString()}`)
    }
  }, [code, error, searchParams, router])

  return null
}


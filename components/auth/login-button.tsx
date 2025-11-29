'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    // Use NEXT_PUBLIC_SITE_URL if set, otherwise fallback to location.origin
    // This allows .env.local to override for development
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    })
  }

  return (
    <Button onClick={handleLogin} size="lg" className="gap-2">
      <Chrome className="h-5 w-5" />
      Sign in with Google
    </Button>
  )
}


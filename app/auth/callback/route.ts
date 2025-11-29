import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle OAuth provider errors (e.g., user denied access)
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorMessage = errorDescription 
      ? encodeURIComponent(errorDescription)
      : encodeURIComponent(`Authentication failed: ${error}`)
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      const errorMessage = encodeURIComponent(exchangeError.message || 'Failed to exchange authorization code')
      return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
    }

    if (!data) {
      console.error('No data returned from code exchange')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No data returned from authentication')}`)
    }

    if (!data.session) {
      console.error('No session in data:', JSON.stringify(data, null, 2))
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to create session')}`)
    }

    // Session created successfully, redirect to dashboard
    const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === 'development'
    if (isLocalEnv) {
      // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle email confirmation flow if needed (code exchange is sufficient usually)
  // If using email confirmation links, they usually point to this route too with a token_hash
  // But Supabase handles code exchange above.

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No authorization code provided')}`)
}


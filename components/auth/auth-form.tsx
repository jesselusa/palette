'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { Chrome, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PasswordStrength } from '@/components/auth/password-strength'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Determine default tab based on query parameter
  const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab)

  // Update active tab when searchParams change
  useEffect(() => {
    const mode = searchParams.get('mode')
    setActiveTab(mode === 'signup' ? 'signup' : 'signin')
  }, [searchParams])

  // Check for error query parameter from OAuth callback
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clean up the URL
      router.replace('/login', { scroll: false })
    }
  }, [searchParams, router])

  const handleOAuth = async (provider: 'google') => {
    setLoading(true)
    setError(null)
    try {
      // Use NEXT_PUBLIC_SITE_URL if set, otherwise fallback to location.origin
      // This allows .env.local to override for development
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin
      const redirectTo = `${siteUrl}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>, mode: 'signin' | 'signup') => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const currentPassword = formData.get('password') as string
    const name = formData.get('name') as string // Only for signup
    
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password: currentPassword,
          options: {
            data: {
              full_name: name,
            },
          },
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
      } else {
        // Use NEXT_PUBLIC_SITE_URL if set, otherwise fallback to location.origin
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
          options: {
            // @ts-ignore
            redirectTo: `${siteUrl}/auth/callback`, // Handle redirect for email link sign ins if configured
          }
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        variant="outline" 
        type="button" 
        className="w-full h-11 font-medium relative"
        onClick={() => handleOAuth('google')} 
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="mr-2 h-5 w-5" /> 
        )}
        Sign in with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={(e) => handleEmailAuth(e, 'signin')} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input 
                id="signin-email" 
                name="email" 
                type="email" 
                required 
                placeholder="m@example.com" 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline" onClick={(e) => { e.preventDefault(); toast.info('Password reset coming soon') }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input 
                  id="signin-password" 
                  name="password" 
                  type={showSignInPassword ? 'text' : 'password'} 
                  required 
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showSignInPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">{showSignInPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={(e) => handleEmailAuth(e, 'signup')} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full name</Label>
              <Input 
                id="signup-name" 
                name="name" 
                type="text" 
                required 
                placeholder="John Doe" 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input 
                id="signup-email" 
                name="email" 
                type="email" 
                required 
                placeholder="m@example.com" 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input 
                  id="signup-password" 
                  name="password" 
                  type={showSignUpPassword ? 'text' : 'password'} 
                  required 
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showSignUpPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">{showSignUpPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

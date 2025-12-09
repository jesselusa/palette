import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { CreditsPurchaseButton } from '@/components/dashboard/credits-purchase-button'
import { CreditsPageClient } from '@/components/dashboard/credits-page-client'
import { Suspense } from 'react'

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance, free_trial_images_used')
    .eq('id', user.id)
    .single()

  const creditsBalance = profile?.credits_balance || 0
  const freeTrialUsed = profile?.free_trial_images_used || 0
  const freeTrialRemaining = Math.max(0, 3 - freeTrialUsed)

  return (
    <>
      <Suspense fallback={null}>
        <CreditsPageClient />
      </Suspense>
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Credits</h1>
          <p className="text-muted-foreground">
            Purchase credits to generate images. 1 credit = 1 image generation.
          </p>
        </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>Current credit balance and free trial status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Credits balance</p>
              <p className="text-2xl font-bold">{creditsBalance}</p>
            </div>
            {creditsBalance === 0 && (
              <div className="text-xs text-muted-foreground">
                No credits
              </div>
            )}
          </div>

          {freeTrialRemaining > 0 && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground">Free trial remaining</p>
              <p className="text-2xl font-bold text-primary">{freeTrialRemaining} image{freeTrialRemaining > 1 ? 's' : ''}</p>
            </div>
          </div>
          )}

          {freeTrialRemaining === 0 && creditsBalance === 0 && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                You've used all free trial images. Purchase credits to continue generating.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buy credits</CardTitle>
          <CardDescription>
            Credits never expire. Use them whenever you need to generate images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">10 credits</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Perfect for getting started
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$9.99</div>
                <div className="text-sm text-muted-foreground">Less than $1 per image</div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>10 image generations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Credits never expire</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Use anytime, anywhere</span>
              </div>
            </div>

            <CreditsPurchaseButton />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Secure payment processing via Stripe</p>
            <p>• Credits are added instantly after payment</p>
            <p>• No subscription required - pay only for what you use</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}

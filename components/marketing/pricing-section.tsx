import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from './fade-in'

export function PricingSection() {
  return (
    <section id="pricing" className="container py-24">
      <FadeIn>
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Start with 3 free images, then pay only for what you use.
          </p>
        </div>
      </FadeIn>

      <div className="flex justify-center">
        <FadeIn delay={0.1}>
          <Card className="w-full max-w-md border-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Pay per image</CardTitle>
              <CardDescription className="text-base">
                No subscriptions, no commitments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold">Less than $1</span>
                  <span className="text-muted-foreground">per image</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  1 credit = 1 image generation
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">3 free images to start</p>
                    <p className="text-sm text-muted-foreground">
                      Try Palette risk-free with your first 3 generations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Buy in bundles of 10</p>
                    <p className="text-sm text-muted-foreground">
                      $9.99 for 10 credits - credits never expire
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">No hidden fees</p>
                    <p className="text-sm text-muted-foreground">
                      Pay only for what you generate
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/login?mode=signup" className="block">
                <Button size="lg" className="w-full">
                  Get started for free
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                No credit card required to start
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </section>
  )
}

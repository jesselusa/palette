import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from './fade-in'
import { SmoothScrollLink } from './smooth-scroll-link'

export function HeroSection() {
  return (
    <section className="relative flex flex-col justify-center min-h-[calc(100vh-3.5rem)] py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container flex flex-col items-center text-center gap-8">
        <FadeIn delay={0.2}>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-6xl mx-auto">
            <span className="block">Professional product photos</span>
            <span className="block text-primary">generated in seconds</span>
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            Transform simple product shots into high-converting e-commerce imagery. 
            No expensive studio, no complex software. Just upload and describe.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.4} className="w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link href="/login?mode=signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 h-12 text-base">
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <SmoothScrollLink href="#gallery" variant="outline" size="lg" className="w-full sm:w-auto h-12 text-base">
              View examples
            </SmoothScrollLink>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}


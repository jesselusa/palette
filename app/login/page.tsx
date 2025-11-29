import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'
import { FadeIn } from '@/components/marketing/fade-in'
import { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Login - Palette',
  description: 'Sign in or create an account to generate professional product photography with AI.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Marketing/Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-muted/30 p-10 lg:p-16 border-r">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <div className="relative h-16 w-48">
            <Image 
              src="/logo_16x9.jpeg"  
              alt="Palette" 
              fill 
              sizes="160px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <div className="max-w-lg">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Create professional product photography in seconds
            </h2>
            <p className="text-muted-foreground text-lg">
              Create high-quality product photos in minutes. Save time and money with AI-powered photography that transforms your products.
            </p>
          </FadeIn>
        </div>

        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Palette Pics. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden mb-8 text-center flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-xl">
              <div className="relative h-16 w-48">
                <Image 
                  src="/logo_16x9.jpeg" 
                  alt="Palette" 
                  fill 
                  sizes="160px"
                  className="object-contain object-center"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <AuthForm />
          </Suspense>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

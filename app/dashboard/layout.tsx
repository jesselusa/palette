import { EmailDropdown } from '@/components/dashboard/email-dropdown'
import { DashboardMobileNav } from '@/components/dashboard/mobile-nav'
import { CreditsDisplay } from '@/components/dashboard/credits-display'
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown'
import { GlobalProgressWidget } from '@/components/dashboard/global-progress-widget'
import { GenerationProvider } from '@/contexts/generation-context'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <GenerationProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-14 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="relative h-8 w-32">
                <Image 
                  src="/logo_16x9.svg" 
                  alt="Palette" 
                  fill 
                  sizes="128px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                <Link href="/dashboard/create" className="hover:text-foreground">Create</Link>
              </nav>
              <div className="flex items-center gap-4">
                {/* Credit Balance Display */}
                <CreditsDisplay />
                {/* Notifications Dropdown */}
                <NotificationsDropdown />
                <EmailDropdown email={user.email || ''} />
              </div>
            </div>
            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Credit Balance Display */}
              <CreditsDisplay />
              {/* Notifications Dropdown */}
              <NotificationsDropdown />
              <DashboardMobileNav />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          {children}
        </main>
        {/* Global Progress Widget */}
        <GlobalProgressWidget />
      </div>
    </GenerationProvider>
  )
}

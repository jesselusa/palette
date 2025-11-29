import { EmailDropdown } from '@/components/dashboard/email-dropdown'
import { DashboardMobileNav } from '@/components/dashboard/mobile-nav'
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="relative h-12 w-40">
              <Image 
                src="/logo_16x9.jpeg" 
                alt="Palette" 
                fill 
                sizes="160px"
                className="object-cover object-left"
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
              <EmailDropdown email={user.email || ''} />
            </div>
          </div>
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <DashboardMobileNav />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  )
}

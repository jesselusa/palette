'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <nav className="flex flex-col gap-1 pt-6">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start h-12 px-4 text-base font-medium">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/create" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start h-12 px-4 text-base font-medium">
              Create
            </Button>
          </Link>
          <Link href="/dashboard/account" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start h-12 px-4 text-base font-medium">
              Account
            </Button>
          </Link>
          <div className="h-px bg-border my-2" />
          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 px-4 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}


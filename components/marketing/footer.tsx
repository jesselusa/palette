import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <div className="relative h-12 w-40">
                <Image 
                  src="/logo_16x9.jpeg" 
                  alt="Palette" 
                  fill 
                  sizes="160px"
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered product photography for modern e-commerce brands. Create studio-quality images in seconds.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Product</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="/#gallery" className="hover:text-foreground transition-colors">Examples</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            </nav>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Palette Pics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

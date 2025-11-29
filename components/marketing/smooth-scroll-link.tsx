'use client'

import { ReactNode } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { type VariantProps } from 'class-variance-authority'

interface SmoothScrollLinkProps {
  href: string
  children: ReactNode
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  className?: string
}

export function SmoothScrollLink({ href, children, variant, size, className }: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      <Button variant={variant} size={size} className="w-full">
        {children}
      </Button>
    </a>
  )
}


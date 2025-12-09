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

  // Extract width and height classes from className to apply to Button
  const widthMatch = className?.match(/w-\[?\w+\]?/)?.[0]
  const heightMatch = className?.match(/h-\[?\w+\]?/)?.[0]
  const textBaseMatch = className?.match(/text-base/)?.[0]
  
  const buttonClasses = [
    widthMatch || 'w-full',
    heightMatch || '',
    textBaseMatch || ''
  ].filter(Boolean).join(' ')

  return (
    <a href={href} onClick={handleClick} className={className}>
      <Button variant={variant} size={size} className={buttonClasses}>
        {children}
      </Button>
    </a>
  )
}


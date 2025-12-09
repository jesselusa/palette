'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

interface GenerationNotificationProps {
  activeCount: number
  onClick: () => void
}

export function GenerationNotification({ activeCount, onClick }: GenerationNotificationProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`relative h-9 w-9 ${activeCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}
    >
      <Bell className="h-5 w-5" />
      {activeCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {activeCount}
        </Badge>
      )}
      <span className="sr-only">
        {activeCount > 0 
          ? `${activeCount} generation${activeCount > 1 ? 's' : ''} ready to view`
          : 'No new generations'}
      </span>
    </Button>
  )
}

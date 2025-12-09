'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface PaymentSuccessAnimationProps {
  show: boolean
  onComplete?: () => void
}

export function PaymentSuccessAnimation({ show, onComplete }: PaymentSuccessAnimationProps) {
  useEffect(() => {
    if (show) {
      // Hide after animation completes
      const timer = setTimeout(() => {
        onComplete?.()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Grey backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
          />

          {/* Circle overlay - above the grey backdrop */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative w-32 h-32 bg-background rounded-full flex items-center justify-center shadow-2xl border border-border"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>

          {/* Success text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mt-32 text-center space-y-1"
          >
            <p className="text-sm font-medium text-foreground">Payment successful!</p>
            <p className="text-xs text-muted-foreground">10 credits added</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

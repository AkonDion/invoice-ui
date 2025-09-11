"use client"

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, X, XCircle } from 'lucide-react'
import { money } from '@/lib/invoice/adapter'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  paymentType: 'CREDIT_CARD' | 'ACH'
  status: 'APPROVED' | 'DECLINED' | 'PENDING'
  amount: string
  currency: "CAD" | "USD"
  invoiceNumber: string
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  paymentType,
  status,
  amount,
  currency,
  invoiceNumber,
}: PaymentConfirmationModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  const content = useMemo(() => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-white/90" aria-hidden="true" />,
          title: 'Payment Approved',
          description:
            paymentType === 'CREDIT_CARD'
              ? 'Your credit card payment has been processed successfully.'
              : 'Your ACH payment has been initiated successfully.',
          glow: 'from-green-400/20',
        }
      case 'DECLINED':
        return {
          icon: <XCircle className="h-16 w-16 text-white/90" aria-hidden="true" />,
          title: 'Payment Declined',
          description:
            'Your payment could not be processed. Please try again or use a different payment method.',
          glow: 'from-red-400/20',
        }
      case 'PENDING':
      default:
        return {
          icon: <Clock className="h-16 w-16 text-white/90" aria-hidden="true" />,
          title: 'Payment Pending',
          description:
            'Your ACH payment is being processed. This may take 3-5 business days to complete.',
          glow: 'from-blue-400/20',
        }
    }
  }, [status, paymentType])

  // Lock background scroll when open and restore on close
  useEffect(() => {
    if (!isOpen) return
    const { body, documentElement } = document
    const originalOverflow = body.style.overflow
    const originalPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      body.style.overflow = originalOverflow
      body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen])

  // Focus management: focus trap within dialog and restore previously focused element
  useEffect(() => {
    if (!isOpen) return
    lastFocusedRef.current = document.activeElement as HTMLElement | null

    const dialog = dialogRef.current
    if (!dialog) return

    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))

    const focusables = getFocusable()
    ;(focusables[0] || dialog).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab') {
        const items = getFocusable()
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first || active === dialog) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Restore focus
      lastFocusedRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent clicks inside the dialog from closing it
      e.stopPropagation()
    },
    []
  )

  const labelId = 'payment-confirmation-title'
  const descId = 'payment-confirmation-description'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Centered container */}
          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelId}
              aria-describedby={descId}
              tabIndex={-1}
              onClick={handleContainerClick}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className={
                'relative w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-b from-white/20 to-white/10 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl'
              }
            >
              {/* Subtle colored glow ring */}
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10`} />
              <div className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b ${content.glow} to-transparent opacity-30`} />

              {/* Close button (top-right) */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/90 transition-all hover:scale-105 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Body */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}>
                  {content.icon}
                </motion.div>

                <h2 id={labelId} className="mt-4 text-2xl font-semibold text-white">
                  {content.title}
                </h2>

                <div className="mt-2 text-3xl font-bold tracking-tight text-white">
                  {money(parseFloat(amount), currency)}
                </div>

                <p className="mt-1 text-sm text-white/70">Invoice #{invoiceNumber}</p>

                <p id={descId} className="mt-4 text-white/80">
                  {content.description}
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-2xl bg-white/10 border border-white/20 text-white transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

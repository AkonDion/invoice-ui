"use client"

import { useEffect, useMemo, useRef } from 'react'
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
          icon: <CheckCircle2 className="h-16 w-16 text-green-400" aria-hidden="true" />,
          title: 'Payment Approved',
          description:
            paymentType === 'CREDIT_CARD'
              ? 'Your credit card payment has been processed successfully.'
              : 'Your ACH payment has been initiated successfully.',
          glow: 'from-green-500/20',
          containerClass: 'bg-gradient-to-b from-white/20 to-white/10'
        }
      case 'DECLINED':
        return {
          icon: <XCircle className="h-16 w-16 text-red-400" aria-hidden="true" />,
          title: 'Payment Declined',
          description:
            'Your payment could not be processed. Please try again or use a different payment method.',
          glow: 'from-red-500/20',
          containerClass: 'bg-gradient-to-b from-red-500/20 to-red-500/5'
        }
      case 'PENDING':
      default:
        return {
          icon: <Clock className="h-16 w-16 text-blue-400" aria-hidden="true" />,
          title: 'Payment Pending',
          description:
            'Your ACH payment is being processed. This may take 3-5 business days to complete.',
          glow: 'from-blue-500/20',
          containerClass: 'bg-gradient-to-b from-white/20 to-white/10'
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Centered container */}
      <div className="flex min-h-full items-center justify-center p-4" onClick={handleBackdropClick}>
        {/* Dialog */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-confirmation-title"
          aria-describedby="payment-confirmation-description"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-md rounded-2xl ${content.containerClass} backdrop-blur-md border border-white/20 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300`}
        >
          {/* Close button (top-right) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/90 transition-all hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Body */}
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
            <div className="rounded-full bg-white/10 p-6 border border-white/20">
              {content.icon}
            </div>

            <div className="text-center space-y-4">
              <h2 id="payment-confirmation-title" className="text-2xl font-medium text-white">
                {content.title}
              </h2>

              <div className="text-3xl font-bold tracking-tight text-white">
                {money(parseFloat(amount), currency)}
              </div>

              <p className="text-sm text-white/70">Invoice #{invoiceNumber}</p>

              <p id="payment-confirmation-description" className="text-white/80">
                {content.description}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
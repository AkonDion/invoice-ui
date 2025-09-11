"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { money } from '@/lib/invoice/adapter'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  paymentType: 'CREDIT_CARD' | 'ACH'
  status: 'APPROVED' | 'DECLINED' | 'PENDING'
  amount: string
  currency: string
  invoiceNumber: string
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  paymentType,
  status,
  amount,
  currency,
  invoiceNumber
}: PaymentConfirmationModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Get status-specific content
  const getStatusContent = () => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-white/90" />,
          title: 'Payment Approved',
          description: paymentType === 'CREDIT_CARD'
            ? 'Your credit card payment has been processed successfully.'
            : 'Your ACH payment has been initiated successfully.',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-white/20'
        }
      case 'DECLINED':
        return {
          icon: <XCircle className="w-16 h-16 text-white/90" />,
          title: 'Payment Declined',
          description: 'Your payment could not be processed. Please try again or use a different payment method.',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-white/20'
        }
      case 'PENDING':
        return {
          icon: <Clock className="w-16 h-16 text-white/90" />,
          title: 'Payment Pending',
          description: 'Your ACH payment is being processed. This may take 3-5 business days to complete.',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-white/20'
        }
    }
  }

  const content = getStatusContent()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className={`mx-4 rounded-2xl ${content.bgColor} backdrop-blur-md border ${content.borderColor} shadow-xl overflow-hidden`}>
              {/* Content */}
              <div className="p-6 flex flex-col items-center text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  {content.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 text-2xl font-semibold text-white"
                >
                  {content.title}
                </motion.h2>

                {/* Amount */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-3xl font-bold text-white"
                >
                  {money(amount, currency)}
                </motion.div>

                {/* Invoice Number */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-1 text-sm text-white/70"
                >
                  Invoice #{invoiceNumber}
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-white/80"
                >
                  {content.description}
                </motion.p>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="mt-6 px-6 py-2 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

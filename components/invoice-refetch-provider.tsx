'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { InvoicePayload } from '@/types/invoice'
import { log } from '@/lib/logger'

interface InvoiceRefetchContextType {
  invoice: InvoicePayload | null
  refetchInvoice: () => Promise<void>
  isLoading: boolean
}

const InvoiceRefetchContext = createContext<InvoiceRefetchContextType | null>(null)

interface InvoiceRefetchProviderProps {
  children: React.ReactNode
  initialInvoice: InvoicePayload
  token: string
}

export function InvoiceRefetchProvider({ 
  children, 
  initialInvoice, 
  token
}: InvoiceRefetchProviderProps) {
  const [invoice, setInvoice] = useState<InvoicePayload>(initialInvoice)
  const [isLoading, setIsLoading] = useState(false)

  const refetchInvoice = async () => {
    setIsLoading(true)
    try {
      // Use API route instead of direct Supabase client
      const response = await fetch(`/api/invoice/refetch?token=${encodeURIComponent(token)}`)
      
      if (!response.ok) {
        log.error('Failed to refetch invoice:', response.statusText)
        return
      }

      const data = await response.json()
      
      if (data.invoice) {
        // Debug: Log the received data
        log.debug('🔄 Refetch - Received invoice data:', {
          status: data.invoice.status,
          amountPaid: data.invoice.amountPaid,
          amountDue: data.invoice.amountDue,
          datePaid: data.invoice.datePaid
        })
        setInvoice(data.invoice)
        log.debug('✅ Invoice data refetched successfully')
      } else {
        log.error('No invoice data received from refetch')
      }
    } catch (error) {
      log.error('❌ Error refetching invoice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refetch when component mounts (e.g., returning from success page)
  useEffect(() => {
    // Longer delay to ensure payment processing has completed and database is updated
    const timer = setTimeout(() => {
      refetchInvoice()
    }, 2000)

    return () => clearTimeout(timer)
  }, [token])

  // Listen for focus events to refetch when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      refetchInvoice()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [token])

  return (
    <InvoiceRefetchContext.Provider value={{ invoice, refetchInvoice, isLoading }}>
      {children}
    </InvoiceRefetchContext.Provider>
  )
}

export function useInvoiceRefetch() {
  const context = useContext(InvoiceRefetchContext)
  if (!context) {
    throw new Error('useInvoiceRefetch must be used within InvoiceRefetchProvider')
  }
  return context
}

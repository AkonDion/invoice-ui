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
      // Use API route with cache-busting parameters
      const timestamp = Date.now()
      const response = await fetch(`/api/invoice/refetch?token=${encodeURIComponent(token)}&_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
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
    refetchInvoice()
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

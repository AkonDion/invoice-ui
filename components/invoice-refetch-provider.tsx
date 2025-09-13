'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { InvoicePayload } from '@/types/invoice'

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
        console.error('Failed to refetch invoice:', response.statusText)
        return
      }

      const data = await response.json()
      
      if (data.invoice) {
        setInvoice(data.invoice)
        console.log('✅ Invoice data refetched successfully')
      } else {
        console.error('No invoice data received from refetch')
      }
    } catch (error) {
      console.error('❌ Error refetching invoice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refetch when component mounts (e.g., returning from success page)
  useEffect(() => {
    // Small delay to ensure any server-side updates have propagated
    const timer = setTimeout(() => {
      refetchInvoice()
    }, 500)

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

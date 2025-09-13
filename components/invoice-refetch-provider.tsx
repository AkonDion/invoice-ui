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
  supabaseUrl: string
  supabaseAnonKey: string
}

export function InvoiceRefetchProvider({ 
  children, 
  initialInvoice, 
  token,
  supabaseUrl,
  supabaseAnonKey
}: InvoiceRefetchProviderProps) {
  const [invoice, setInvoice] = useState<InvoicePayload>(initialInvoice)
  const [isLoading, setIsLoading] = useState(false)

  const refetchInvoice = async () => {
    setIsLoading(true)
    try {
      // Create Supabase client with passed credentials
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Fetch fresh invoice data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("token", token)
        .single()

      if (invoiceError || !invoiceData) {
        console.error("Invoice refetch error:", invoiceError)
        return
      }

      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceData.invoice_id)
        .order("line_index")

      if (itemsError || !itemsData) {
        console.error("Invoice items refetch error:", itemsError)
        return
      }

      // Transform the data to match InvoicePayload format
      const updatedInvoice: InvoicePayload = {
        invoiceId: invoiceData.invoice_id,
        tipAmount: 0,
        depositAmount: 0,
        orderFields: [],
        invoiceNumber: invoiceData.invoice_number,
        token: invoiceData.token,
        amount: invoiceData.amount,
        amountPaid: invoiceData.amount_paid,
        amountDue: invoiceData.amount_due,
        currency: invoiceData.currency,
        type: invoiceData.type,
        hasConvenienceFee: typeof invoiceData.has_convenience_fee === 'number' ? invoiceData.has_convenience_fee : Number(invoiceData.has_convenience_fee),
        dateCreated: invoiceData.date_created,
        dateUpdated: invoiceData.date_updated,
        dateIssued: invoiceData.date_issued,
        datePaid: invoiceData.date_paid,
        status: invoiceData.status,
        customerId: invoiceData.customer_id,
        customerCode: invoiceData.customer_code,
        notes: invoiceData.notes,
        tax: {
          details: invoiceData.tax_details,
          amount: invoiceData.tax_amount,
        },
        discounts: {
          details: invoiceData.discount_details,
          amount: invoiceData.discount_amount,
        },
        billingAddress: {
          name: invoiceData.billing_name,
          street1: invoiceData.billing_street1,
          street2: invoiceData.billing_street2,
          city: invoiceData.billing_city,
          province: invoiceData.billing_province,
          country: invoiceData.billing_country,
          postalCode: invoiceData.billing_postal_code,
          phone: invoiceData.billing_phone,
          email: invoiceData.billing_email,
        },
        shipping: {
          amount: invoiceData.shipping_amount,
          details: invoiceData.shipping_details,
          address: {
            name: invoiceData.shipping_name,
            street1: invoiceData.shipping_street1,
            street2: invoiceData.shipping_street2,
            city: invoiceData.shipping_city,
            province: invoiceData.shipping_province,
            country: invoiceData.shipping_country,
            postalCode: invoiceData.shipping_postal_code,
            phone: invoiceData.shipping_phone,
            email: invoiceData.shipping_email,
          },
        },
        lineItems: itemsData.map(item => ({
          lineIndex: item.line_index,
          sku: item.sku,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          taxAmount: item.tax_amount,
          discountAmount: item.discount_amount,
        })),
        pickup: {
          name: invoiceData.pickup_name,
          date: invoiceData.pickup_date,
        },
      }

      setInvoice(updatedInvoice)
      console.log('✅ Invoice data refetched successfully')
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

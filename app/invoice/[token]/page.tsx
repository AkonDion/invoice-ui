"use client"

import { InvoiceCard } from "@/components/invoice-card"
import type { InvoicePayload } from "@/types/invoice"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

interface InvoicePageProps {
  params: {
    token: string
  }
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const { token } = params
  const [invoice, setInvoice] = useState<InvoicePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get invoice header
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('token', token)
          .single()

        if (invoiceError) {
          console.error('Invoice fetch error:', invoiceError)
          throw invoiceError
        }

        console.log('Raw Invoice data:', {
          has_convenience_fee: invoiceData.has_convenience_fee,
          convenience_fee_enabled: invoiceData.convenience_fee_enabled,
          convenience_fee: invoiceData.convenience_fee
        })

        // Get invoice items
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoiceData.invoice_id)
          .order('line_index')

        if (itemsError) throw itemsError

        // Transform the data to match InvoicePayload type
        const invoice: InvoicePayload = {
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
          convenienceFee: invoiceData.convenience_fee,
          convenienceFeeEnabled: invoiceData.convenience_fee_enabled,
          hasConvenienceFee: invoiceData.has_convenience_fee,
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
            amount: invoiceData.tax_amount
          },
          discounts: {
            details: invoiceData.discount_details,
            amount: invoiceData.discount_amount
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
            email: invoiceData.billing_email
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
              email: invoiceData.shipping_email
            }
          },
          lineItems: itemsData.map(item => ({
            lineIndex: item.line_index,
            sku: item.sku,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            taxAmount: item.tax_amount,
            discountAmount: item.discount_amount
          })),
          pickup: {
            name: invoiceData.pickup_name,
            date: invoiceData.pickup_date
          }
        }

        console.log('Transformed Invoice:', {
          hasConvenienceFee: invoice.hasConvenienceFee,
          convenienceFeeEnabled: invoice.convenienceFeeEnabled,
          convenienceFee: invoice.convenienceFee
        })
        setInvoice(invoice)
      } catch (error) {
        console.error('Error fetching invoice:', error)
        setError(error instanceof Error ? error.message : 'Failed to load invoice')
      }
    }

    fetchInvoice()
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen relative pb-20 md:pb-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/Grid%202.png)",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-white">Unable to Load Invoice</h1>
              <p className="text-white/70">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen relative pb-20 md:pb-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/Grid%202.png)",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-white">Loading Invoice...</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/Grid%202.png)",
        }}
      />

      {/* Invoice Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-8 px-4">
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}
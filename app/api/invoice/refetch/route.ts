import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { InvoicePayload } from '@/types/invoice'
import { log } from '@/lib/logger'

// Ensure Node runtime with minimal caching for fresh data
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0 // No caching - always fetch fresh data

// Use SERVICE ROLE on the server so RLS doesn't block reads/writes
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  log.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl!, supabaseServiceRole!)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Debug: Log the Supabase client configuration
    log.debug('🔧 Refetch - Supabase client config:', {
      url: supabaseUrl?.substring(0, 30) + '...',
      hasServiceRole: !!supabaseServiceRole,
      serviceRoleLength: supabaseServiceRole?.length
    })

    // Fetch invoice with items in a single optimized query
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        invoice_items (
          line_index,
          sku,
          description,
          quantity,
          price,
          total,
          tax_amount,
          discount_amount
        )
      `)
      .eq("token", token)
      .single()

    if (invoiceError || !invoiceData) {
      log.error("Invoice refetch error:", invoiceError)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Extract items from the joined query result
    const itemsData = invoiceData.invoice_items || []

    // Transform the data to match InvoicePayload format
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
      invoiceUrl: invoiceData.invoice_url,
      receiptUrl: invoiceData.receipt_url,
    }

    // Debug: Log the final response data
    log.debug('📤 Refetch - Sending response:', {
      status: invoice.status,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      datePaid: invoice.datePaid,
      invoiceId: invoice.invoiceId
    })

    const response = NextResponse.json(invoice)
    
    // Add cache-busting headers to prevent browser caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    log.error('Unexpected error in refetch route:', error)
    return NextResponse.json({
      error: 'Internal server error during invoice refetch'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { InvoicePayload } from '@/types/invoice'

// Ensure Node runtime and no static caching
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Use SERVICE ROLE on the server so RLS doesn't block reads/writes
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl!, supabaseServiceRole!)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Fetch fresh invoice data
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("token", token)
      .single()

    if (invoiceError || !invoiceData) {
      console.error("Invoice refetch error:", invoiceError)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Fetch invoice items
    const { data: itemsData, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceData.invoice_id)
      .order("line_index")

    if (itemsError || !itemsData) {
      console.error("Invoice items refetch error:", itemsError)
      return NextResponse.json({ error: 'Invoice items not found' }, { status: 404 })
    }

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
    }

    return NextResponse.json({ invoice })

  } catch (error) {
    console.error('Unexpected error in refetch route:', error)
    return NextResponse.json({
      error: 'Internal server error during invoice refetch'
    }, { status: 500 })
  }
}

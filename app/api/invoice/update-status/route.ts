import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

interface UpdateStatusRequest {
  invoiceNumber: string
  status: string
  transactionId: string
}

export async function POST(req: NextRequest) {
  try {
    const body: UpdateStatusRequest = await req.json()
    const { invoiceNumber, status, transactionId } = body

    // Validate required fields
    if (!invoiceNumber || !status || !transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: invoiceNumber, status, and transactionId are required'
      }, { status: 400 })
    }

    // Validate status value
    const validStatuses = ['DUE', 'PAID', 'PARTIAL', 'VOID', 'REFUNDED', 'DRAFT', 'SENT']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 })
    }

    // First, get the current invoice to check if it exists and get the amount
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('invoice_id, amount, amount_due, status')
      .eq('invoice_number', invoiceNumber)
      .single()

    if (fetchError || !invoice) {
      console.error('Invoice lookup failed:', fetchError || 'no invoice found')
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    }

    // If marking as paid, set the payment date and amount
    if (status === 'PAID') {
      updateData.date_paid = new Date().toISOString()
      updateData.amount_paid = invoice.amount_due || invoice.amount
    } else if (status === 'DUE' && invoice.status === 'PAID') {
      // If reverting from PAID back to DUE (e.g., declined payment), clear payment info
      updateData.date_paid = null
      updateData.amount_paid = 0
    }

    // Update the invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('invoice_number', invoiceNumber)
      .select('invoice_number, status, date_paid, amount_paid')
      .single()

    if (updateError) {
      console.error('Invoice update failed:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update invoice status'
      }, { status: 500 })
    }

    // Log the successful update
    console.warn('Invoice status updated:', {
      invoiceNumber,
      oldStatus: invoice.status,
      newStatus: status,
      transactionId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice status updated successfully',
      invoiceNumber: updatedInvoice.invoice_number,
      newStatus: updatedInvoice.status,
      datePaid: updatedInvoice.date_paid,
      amountPaid: updatedInvoice.amount_paid
    })

  } catch (error) {
    console.error('Unexpected error in update-status route:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during invoice update'
    }, { status: 500 })
  }
}

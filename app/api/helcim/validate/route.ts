import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Ensure Node runtime (crypto) and no static caching
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Use SERVICE ROLE on the server so RLS doesn't block reads/writes
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl!, supabaseServiceRole!)

interface HelcimCCResponse {
  transactionId: string
  dateCreated: string
  cardBatchId: string
  status: string // "APPROVED", etc.
  type: string   // "purchase", etc.
  amount: string
  currency: string
  avsResponse?: string
  cvvResponse?: string
  approvalCode?: string
  cardToken?: string
  cardNumber?: string
  cardHolderName?: string
  customerCode?: string
  invoiceNumber?: string
  warning?: string
}

interface HelcimACHResponse {
  amount: string
  approvalCode: string
  bankAccountNumber: string
  bankToken: string
  batchId: string
  currency: string
  customerCode: string
  dateCreated: string
  invoiceNumber: string
  statusAuth: string
  statusClearing: string
  transactionId: string
  type: string
}

function computeHash(rawData: HelcimCCResponse | HelcimACHResponse, secretToken: string): string {
  // Canonicalize JSON (no whitespace), append secretToken, then SHA-256
  const cleaned = JSON.stringify(JSON.parse(JSON.stringify(rawData)))
  return createHash('sha256').update(cleaned + secretToken, 'utf8').digest('hex')
}

function safeLog(obj: unknown) {
  try {
    return JSON.stringify(obj)
  } catch {
    return '[unserializable]'
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> | null = null
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }

    const rawDataResponse = body?.rawDataResponse as HelcimCCResponse | HelcimACHResponse | undefined
    const checkoutToken = body?.checkoutToken as string | undefined
    const hash = body?.hash as string | undefined

    // Basic request validation
    if (!rawDataResponse || !checkoutToken || !hash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: rawDataResponse, checkoutToken, or hash' 
      }, { status: 400 })
    }

    // Lookup secretToken for this checkoutToken (must have been saved at initialization)
    // Expect a row inserted on init with fields:
    //   payment_type: 'INITIALIZATION', checkout_token, secret_token, token_expires_at
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('payment_transactions')
      .select('secret_token, token_expires_at')
      .eq('checkout_token', checkoutToken)
      .eq('payment_type', 'INITIALIZATION')
      .single()

    if (tokenErr || !tokenRow) {
      console.error('Secret token lookup failed:', tokenErr || 'no row')
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or unknown checkout token' 
      }, { status: 400 })
    }

    if (new Date() > new Date(tokenRow.token_expires_at)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Checkout token has expired' 
      }, { status: 400 })
    }

    const secretToken = tokenRow.secret_token as string
    const calculatedHash = computeHash(rawDataResponse, secretToken)

    const isValid = calculatedHash === hash

    // Persist the transaction row (optional; adjust table as needed)
    try {
      const isCreditCard = !('bankToken' in rawDataResponse)
      const { error: insertErr } = await supabase.from('payment_transactions').insert({
        transaction_id: rawDataResponse.transactionId,
        date_created: rawDataResponse.dateCreated,
        payment_type: isCreditCard ? 'CREDIT_CARD' : 'ACH',
        status: isCreditCard
          ? (rawDataResponse as HelcimCCResponse).status
          : (rawDataResponse as HelcimACHResponse).statusAuth,
        amount: parseFloat(rawDataResponse.amount),
        currency: rawDataResponse.currency,
        customer_code: rawDataResponse.customerCode,
        invoice_number: rawDataResponse.invoiceNumber,
        card_token: isCreditCard ? (rawDataResponse as HelcimCCResponse).cardToken ?? null : null,
        card_last_four: isCreditCard ? ((rawDataResponse as HelcimCCResponse).cardNumber ?? '').slice(-4) : null,
        bank_token: !isCreditCard ? (rawDataResponse as HelcimACHResponse).bankToken : null,
        bank_account_last_four: !isCreditCard ? (rawDataResponse as HelcimACHResponse).bankAccountNumber.slice(-4) : null,
        hash_validated: isValid,
        response_data: rawDataResponse
      })
      if (insertErr) {
        console.error('Insert payment_transactions error:', insertErr)
      }
    } catch (e) {
      console.error('Unexpected insert error:', e)
    }

    // Structured log
    process.stdout.write(`[HELCIM-VALIDATE] ${safeLog({
      ts: new Date().toISOString(),
      checkoutToken: checkoutToken?.slice(0, 8) + '…',
      receivedHash: hash?.slice(0, 10) + '…',
      calculatedHash: calculatedHash?.slice(0, 10) + '…',
      isValid
    })}\n`)

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment response signature',
          hashMatch: false
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: rawDataResponse.transactionId,
      paymentType: 'bankToken' in rawDataResponse ? 'ACH' : 'CREDIT_CARD',
      status: 'bankToken' in rawDataResponse
        ? (rawDataResponse as HelcimACHResponse).statusAuth
        : (rawDataResponse as HelcimCCResponse).status
    })
  } catch (error) {
    console.error('Unexpected error in validation route:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during validation'
    }, { status: 500 })
  }
}

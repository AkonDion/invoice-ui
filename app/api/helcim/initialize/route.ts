import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/logger';

// Ensure Node runtime and no static caching
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Use SERVICE ROLE on the server so RLS doesn't block reads/writes
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRole) {
  log.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice, confirmationScreen = false } = body;
    
    // Validate required fields
    if (!invoice || !invoice.amount || !invoice.currency) {
      log.error('Missing invoice data in Helcim initialization request');
      return NextResponse.json(
        { error: 'Invoice data is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.HELCIM_API_TOKEN) {
      log.error('Helcim API token not configured');
      return NextResponse.json(
        { error: 'Helcim API token not configured' },
        { status: 500 }
      );
    }

    // Prepare the Helcim payment request
    const requestBody: {
      customStyling: {
        appearance: string;
        brandColor: string;
        ctaButtonText: string;
      };
      paymentType: string;
      amount: number;
      currency: string;
      customerCode: string;
      invoiceNumber: string;
      paymentMethod: string;
      hasConvenienceFee: number;
      confirmationScreen: boolean;
      displayContactFields: number;
      returnUrl?: string;
      cancelUrl?: string;
    } = {
      customStyling: {
        appearance: "dark",
        brandColor: process.env.HELCIM_BRAND_COLOR?.replace('#', '') || "00D6AF",
        ctaButtonText: "pay"
      },
      paymentType: 'purchase',
      amount: invoice.amount,
      currency: invoice.currency,
      customerCode: invoice.customerCode,
      invoiceNumber: invoice.invoiceNumber,
      paymentMethod: 'cc-ach',
      hasConvenienceFee: invoice.hasConvenienceFee ? 1 : 0, // Ensure it's exactly 1 or 0
      confirmationScreen: confirmationScreen,
      displayContactFields: 0
    };

    // Add return URLs
    requestBody.returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${invoice.token}?payment=success`;
    requestBody.cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${invoice.token}?payment=cancelled`;

    // Call Helcim API
    const response = await fetch(`${process.env.HELCIM_API_BASE}/helcim-pay/initialize`, {
      method: 'POST',
      headers: {
        'api-token': process.env.HELCIM_API_TOKEN!,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Log initialization request to Railway
    process.stdout.write(`[HELCIM-INIT] Payment request: ${JSON.stringify({
      event: 'payment_initialization',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      request: {
        amount: requestBody.amount,
        currency: requestBody.currency,
        customerCode: requestBody.customerCode,
        invoiceNumber: requestBody.invoiceNumber,
        paymentMethod: requestBody.paymentMethod,
        hasConvenienceFee: requestBody.hasConvenienceFee
      }
    }, null, 2)}\n`);

    // Log successful initialization
    process.stdout.write(`[HELCIM-INIT] ✅ Payment initialized: ${JSON.stringify({
      event: 'payment_initialization_success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      details: {
        checkoutToken: data.checkoutToken,
        amount: requestBody.amount,
        currency: requestBody.currency,
        invoiceNumber: requestBody.invoiceNumber
      }
    }, null, 2)}\n`);
    
    if (!response.ok) {
      // Log error to Railway
      process.stderr.write(`[HELCIM-ERROR] ${JSON.stringify({
        event: 'payment_initialization_error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        error: {
          status: response.status,
          statusText: response.statusText,
          message: data.error || data.message,
          details: data
        }
      }, null, 2)}\n`);
      return NextResponse.json(
        { error: `Helcim API Error: ${response.status} - ${data.error || data.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    // Log successful initialization
    log.info('✅ Payment initialized:', JSON.stringify({
      event: 'payment_initialization_success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      details: {
        checkoutToken: data.checkoutToken,
        amount: requestBody.amount,
        currency: requestBody.currency,
        invoiceNumber: requestBody.invoiceNumber
      }
    }, null, 2));

    // Store the secretToken server-side with expiration (60 minutes)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    const { error: storeError } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: `init_${data.checkoutToken}`, // Temporary ID for initialization
        date_created: new Date().toISOString(),
        payment_type: 'INITIALIZATION',
        status: 'PENDING',
        amount: invoice.amount,
        currency: invoice.currency,
        customer_code: invoice.customerCode,
        invoice_number: invoice.invoiceNumber,
        checkout_token: data.checkoutToken,
        secret_token: data.secretToken,
        token_expires_at: expiresAt,
        hash_validated: false,
        response_data: { initialization: true, checkoutToken: data.checkoutToken }
      });

    if (storeError) {
      log.error('Failed to store Helcim tokens:', storeError);
      return NextResponse.json(
        { error: 'Failed to store payment tokens' },
        { status: 500 }
      );
    }

    // Only return checkoutToken to client - secretToken stays server-side
    return NextResponse.json({
      checkoutToken: data.checkoutToken,
    });
  } catch (error) {
    log.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: `Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

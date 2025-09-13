import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice, confirmationScreen = false } = body;
    
    // Validate required fields
    if (!invoice || !invoice.amount || !invoice.currency) {
      console.error('Missing invoice data in Helcim initialization request');
      return NextResponse.json(
        { error: 'Invoice data is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.HELCIM_API_TOKEN) {
      console.error('Helcim API token not configured');
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
    console.warn('✅ Payment initialized:', JSON.stringify({
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

    return NextResponse.json({
      checkoutToken: data.checkoutToken,
      secretToken: data.secretToken,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: `Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

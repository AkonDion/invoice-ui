import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice } = body;
    
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
      paymentMethod: 'cc-ach',
      hasConvenienceFee: invoice.hasConvenienceFee ? 1 : 0, // Ensure it's exactly 1 or 0
      confirmationScreen: true,
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
    
    if (!response.ok) {
      console.error('Helcim API Error:', response.status, response.statusText, data.error || data.message);
      return NextResponse.json(
        { error: `Helcim API Error: ${response.status} - ${data.error || data.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

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

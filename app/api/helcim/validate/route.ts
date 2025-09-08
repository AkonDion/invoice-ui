import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { checkoutToken, secretToken } = await request.json();

    if (!checkoutToken || !secretToken) {
      console.error('Missing Helcim tokens in validation request');
      return NextResponse.json(
        { error: 'Invalid Helcim validation request' },
        { status: 400 }
      );
    }

    if (!process.env.HELCIM_API_TOKEN) {
      console.error('Helcim API token not configured');
      return NextResponse.json(
        { error: 'Helcim API token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${process.env.HELCIM_API_BASE}/helcim-pay/validate`, {
      method: 'POST',
      headers: {
        'api-token': process.env.HELCIM_API_TOKEN,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ checkoutToken, secretToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Helcim validation API error:', {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: 'Payment validation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      approved: data.response?.approved ?? false,
      transactionId: data.transaction?.transactionId,
    });
  } catch (error) {
    console.error('Helcim validation error:', error);
    return NextResponse.json(
      { error: 'Payment validation error' },
      { status: 500 }
    );
  }
}

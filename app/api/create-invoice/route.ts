import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const invoice = await request.json();

    // Return the URL for the invoice
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/invoice/${invoice.token}`;

    return NextResponse.json({ url });

  } catch (error) {
    log.error('Error processing invoice:', error);
    return NextResponse.json(
      { error: 'Failed to process invoice' },
      { status: 500 }
    );
  }
}


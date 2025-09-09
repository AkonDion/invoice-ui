import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice, customerInfo } = body;
    
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

    // Prepare customer request if billing address is available
    const customerRequest = customerInfo ? {
      customerCode: `CUST_${invoice.customerId}`,
      contactName: customerInfo.name || '',
      businessName: customerInfo.businessName || '',
      email: customerInfo.email || '',
      phone: customerInfo.phone || '',
      billingAddress: {
        street1: customerInfo.street1 || '',
        street2: customerInfo.street2 || '',
        city: customerInfo.city || '',
        province: customerInfo.province || '',
        country: customerInfo.country || 'CA',
        postalCode: customerInfo.postalCode || '',
      }
    } : undefined;

    // Prepare invoice request
    const invoiceRequest = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.dateIssued,
      dueDate: invoice.dateIssued, // You might want to calculate this
      currency: invoice.currency,
      customerCode: `CUST_${invoice.customerId}`,
      lineItems: (invoice.lineItems || []).map((item: any) => ({
        description: item.description,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total,
        taxAmount: item.taxAmount,
        discountAmount: item.discountAmount,
      })),
      subtotal: (invoice.lineItems || []).reduce((sum: number, item: any) => sum + item.total, 0),
      taxAmount: invoice.tax?.amount || 0,
      discountAmount: invoice.discounts?.amount || 0,
      totalAmount: invoice.amount,
    };

    // Prepare the request body using actual invoice data
    const requestBody: any = {
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
      hasConvenienceFee: typeof invoice.hasConvenienceFee === 'number' ? invoice.hasConvenienceFee : 0,
      confirmationScreen: true,
      displayContactFields: 1,
      taxAmount: invoice.tax?.amount || 0
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
      console.error('Helcim API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      return NextResponse.json(
        { error: `Helcim API Error: ${response.status} - ${data.message || 'Unknown error'}` },
        { status: 500 }
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

import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // Search for invoice with matching email
    // Search for the most recent invoice for this email
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('token, invoice_number, billing_email, billing_name, date_created')
      .or(`billing_email.eq."${email}",shipping_email.eq."${email}"`)
      .order('date_created', { ascending: false })
      .limit(1);

    const invoice = invoices?.[0];

    if (error || !invoice) {
      return Response.json({ 
        found: false,
        message: 'No invoice found for this email address' 
      });
    }

    // Send to webhook
    const webhookResponse = await fetch('https://nodechain.dev/webhook/c4321de2-7eef-48f0-8928-c3b9a7e602e0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: invoice.token,
        billing_email: invoice.billing_email,
        billing_name: invoice.billing_name
      })
    });

    if (!webhookResponse.ok) {
      throw new Error('Failed to send invoice link');
    }

    return Response.json({ 
      found: true,
      invoice_number: invoice.invoice_number,
      email: invoice.billing_email
    });

  } catch (error) {
    log.error('Error processing request:', error);
    return Response.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

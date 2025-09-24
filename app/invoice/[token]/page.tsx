import { redirect } from 'next/navigation';
import { InvoiceRefetchProvider } from "@/components/invoice-refetch-provider";
import { InvoiceCardWithRefetch } from "@/components/invoice-card-with-refetch";
import type { InvoicePayload } from "@/types/invoice";
import { createClient } from "@supabase/supabase-js";
import { log } from '@/lib/logger';

// Force dynamic rendering to prevent static caching
export const dynamic = 'force-dynamic';

interface InvoiceItemData {
  line_index: number;
  sku: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  tax_amount: number;
  discount_amount: number;
}

interface InvoicePageProps {
  params: { token: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function getInvoice(token: string, retryCount = 0): Promise<InvoicePayload> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  try {
    // Fetch invoice with items in a single query using join
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        invoice_items (
          line_index,
          sku,
          description,
          quantity,
          price,
          total,
          tax_amount,
          discount_amount
        )
      `)
      .eq("token", token)
      .single();

    if (invoiceError || !invoiceData) {
      log.error("Invoice fetch error:", invoiceError);
      
      // Retry once if it's a timeout or connection error
      if (retryCount === 0 && invoiceError && (invoiceError.code === 'PGRST301' || invoiceError.message?.includes('timeout'))) {
        log.info("Retrying invoice fetch due to timeout...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return getInvoice(token, 1);
      }
      
      // Redirect to home page for failed or expired tokens
      redirect('/');
    }

    // Extract items from the joined query result
    const itemsData = invoiceData.invoice_items || [];

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
    lineItems: itemsData.map((item: InvoiceItemData) => ({
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
    invoiceUrl: invoiceData.invoice_url,
    receiptUrl: invoiceData.receipt_url,
  };

    return invoice;
  } catch (error) {
    log.error("Invoice loading failed:", error);
    // Redirect to home page for any other errors
    redirect('/');
  }
}

export default async function InvoicePage({ params, searchParams }: InvoicePageProps) {
  // Force dynamic rendering to prevent static caching
  const invoice = await getInvoice(params.token);
  const paymentStatus = searchParams?.payment;

  return (
    <InvoiceRefetchProvider 
      initialInvoice={invoice} 
      token={params.token}
    >
      <InvoicePageContent paymentStatus={paymentStatus} />
    </InvoiceRefetchProvider>
  );
}

function InvoicePageContent({ paymentStatus }: { paymentStatus?: string | string[] }) {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative flex flex-col items-center min-h-[100dvh] px-4 pt-8 pb-24 md:pb-8 space-y-4">
        {paymentStatus === 'success' && (
          <div
            role="alert"
            className="w-full max-w-md rounded bg-green-100 p-4 text-green-800"
          >
            Payment successful. Thank you!
          </div>
        )}
        {paymentStatus === 'cancelled' && (
          <div
            role="alert"
            className="w-full max-w-md rounded bg-yellow-100 p-4 text-yellow-800"
          >
            Payment cancelled.
          </div>
        )}
        <InvoiceCardWithRefetch />
      </div>
    </div>
  );
}

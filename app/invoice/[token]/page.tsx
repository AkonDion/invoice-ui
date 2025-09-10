import { InvoiceCard } from "@/components/invoice-card";
import type { InvoicePayload } from "@/types/invoice";
import { createClient } from "@supabase/supabase-js";

interface InvoicePageProps {
  params: { token: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function getInvoice(token: string): Promise<InvoicePayload> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("token", token)
    .single();

  if (invoiceError || !invoiceData) {
    console.error("Invoice fetch error:", invoiceError);
    throw new Error("Unable to load invoice");
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceData.invoice_id)
    .order("line_index");

  if (itemsError || !itemsData) {
    console.error("Invoice items fetch error:", itemsError);
    throw new Error("Unable to load invoice items");
  }

  // Log the raw data from the database
  console.log('Raw invoice data from database:', {
    invoice_id: invoiceData.invoice_id,
    invoice_number: invoiceData.invoice_number,
    token: invoiceData.token,
    customer_code: invoiceData.customer_code
  });

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
    hasConvenienceFee: invoiceData.has_convenience_fee,
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
    lineItems: itemsData.map(item => ({
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
  };

  // Log the transformed invoice object
  console.log('Invoice transformed into InvoicePayload:', {
    token: invoice.token,
    customerCode: invoice.customerCode,
    invoiceNumber: invoice.invoiceNumber
  });

  return invoice;
}

export default async function InvoicePage({ params, searchParams }: InvoicePageProps) {
  const invoice = await getInvoice(params.token);
  const paymentStatus = searchParams?.payment;

  return (
    <div className="min-h-screen overflow-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4 space-y-4">
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
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  );
}
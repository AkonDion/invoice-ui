"use client"

import { InvoiceHeader } from "@/components/invoice-header"
import { BillingBlock } from "@/components/billing-block"
import { TotalsPanel } from "@/components/totals-panel"
import { LineItemsTable } from "@/components/line-items-table"
import { NotesAccordion } from "@/components/notes-accordion"
import { PayNowBar } from "@/components/pay-now-bar"
import { Toast, useToast } from "@/components/toast"
import type { InvoicePayload } from "@/types/invoice"
import { MapPin, Truck } from "lucide-react"

interface InvoiceCardProps {
  invoice: InvoicePayload
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const { toast } = useToast()

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="space-y-6">
          {/* Header */}
          <InvoiceHeader invoice={invoice} />

          {/* Three Card Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BillingBlock
              title="Billing Address"
              address={invoice.billingAddress}
              icon={<MapPin className="w-4 h-4 text-white/70" />}
            />
            <BillingBlock
              title="Shipping Address"
              address={invoice.shipping.address}
              icon={<Truck className="w-4 h-4 text-white/70" />}
            />
            <TotalsPanel invoice={invoice} />
          </div>

          {/* Line Items */}
          <LineItemsTable items={invoice.lineItems} currency={invoice.currency} />

          {/* Notes */}
          <NotesAccordion notes={invoice.notes} />

          {/* Pay Now - Desktop */}
          <div className="hidden md:block">
            <PayNowBar invoice={invoice} />
          </div>
        </div>
      </div>

      {/* Sticky Pay Now Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/20">
        <PayNowBar invoice={invoice} />
      </div>

      <Toast toast={toast} />
    </>
  )
}

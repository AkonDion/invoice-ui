import type { InvoicePayload } from "@/types/invoice"
import { money, calcSubtotal } from "@/lib/invoice/adapter"

interface TotalsPanelProps {
  invoice: InvoicePayload
}

export function TotalsPanel({ invoice }: TotalsPanelProps) {
  const subtotal = calcSubtotal(invoice.lineItems)

  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
      <h3 className="font-semibold text-white text-sm mb-4">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/80">
          <span>Subtotal</span>
          <span>{money(subtotal, invoice.currency)}</span>
        </div>

        {invoice.discounts && invoice.discounts.amount !== 0 && (
          <div className="flex justify-between text-green-300">
            <span>{invoice.discounts.details || "Discount"}</span>
            <span>{money(invoice.discounts.amount, invoice.currency)}</span>
          </div>
        )}

        {invoice.tax && invoice.tax.amount > 0 && (
          <div className="flex justify-between text-white/80">
            <span>{invoice.tax.details || "Tax"}</span>
            <span>{money(invoice.tax.amount, invoice.currency)}</span>
          </div>
        )}

        {invoice.convenienceFeeEnabled && invoice.convenienceFee > 0 && (
          <div className="flex justify-between text-white/80">
            <span>Convenience Fee</span>
            <span>{money(invoice.convenienceFee, invoice.currency)}</span>
          </div>
        )}

        <div className="border-t border-white/20 pt-2 mt-3">
          <div className="flex justify-between text-white font-semibold">
            <span>Total</span>
            <span>{money(invoice.amount, invoice.currency)}</span>
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold text-[#00D6AF]">
          <span>Amount Due</span>
          <span>{money(invoice.amountDue, invoice.currency)}</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import type { InvoicePayload } from "@/types/invoice"
import { formatDate } from "@/lib/invoice/adapter"
import { isPaid } from "@/types/invoice"
import { useToast } from "@/components/toast"

interface InvoiceHeaderProps {
  invoice: InvoicePayload
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const { showToast } = useToast()

  const downloadInvoice = () => {
    if (!invoice.invoiceUrl) {
      showToast("Invoice download URL not available")
      return
    }
    window.open(invoice.invoiceUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden">
            <img 
              src="/Vector (2).png" 
              alt="Company Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-white/80 text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Comfort Hub</span>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Title and Copy Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Invoice #{invoice.invoiceNumber}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadInvoice}
            className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Download className="w-3 h-3" />
            <span className="text-xs ml-1">Download</span>
          </Button>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-sm text-white/60">
          <span>Issued: {formatDate(invoice.dateIssued)}</span>
          <span>Updated: {formatDate(invoice.dateUpdated)}</span>
          {isPaid(invoice) && <span>Paid: {formatDate(invoice.datePaid)}</span>}
        </div>
      </div>
    </div>
  )
}

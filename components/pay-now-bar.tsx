"use client"

import { HelcimPay } from "@/components/helcim-pay"
import type { InvoicePayload } from "@/types/invoice"

interface PayNowBarProps {
  invoice: InvoicePayload
  className?: string
}

export function PayNowBar({ invoice, className = "" }: PayNowBarProps) {
  return (
    <>
      <HelcimPay invoice={invoice} className={className} />
      <div className="mt-4 text-center">
        <p className="text-white/60 text-sm">
          Thank you for choosing us—we're grateful for your business and your confidence in our team.
        </p>
      </div>
    </>
  )
}

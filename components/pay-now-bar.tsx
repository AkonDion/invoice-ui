"use client"

import { HelcimPay } from "@/components/helcim-pay"
import type { InvoicePayload } from "@/types/invoice"

interface PayNowBarProps {
  invoice: InvoicePayload
  className?: string
}

export function PayNowBar({ invoice, className = "" }: PayNowBarProps) {
  return <HelcimPay invoice={invoice} className={className} />
}

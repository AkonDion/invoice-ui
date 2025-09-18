import { Badge } from "@/components/ui/badge"
import type { InvoicePayload } from "@/types/invoice"

interface StatusBadgeProps {
  status: InvoicePayload["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: InvoicePayload["status"]) => {
    switch (status) {
      case "PAID":
        return {
          label: "PAID",
          className: "bg-[#00D6AF]/20 text-white border-[#00D6AF]/30 backdrop-blur-md",
        }
      case "PARTIAL":
        return {
          label: "PARTIAL",
          className: "bg-[#00D6AF]/20 text-white border-[#00D6AF]/30 backdrop-blur-md",
        }
      case "DUE":
        return {
          label: "DUE",
          className: "bg-amber-500/20 text-amber-100 border-amber-400/30 backdrop-blur-md",
        }
      case "VOID":
        return {
          label: "VOID",
          className: "bg-red-500/20 text-red-100 border-red-400/30 backdrop-blur-md",
        }
      case "REFUNDED":
        return {
          label: "REFUNDED",
          className: "bg-blue-500/20 text-blue-100 border-blue-400/30 backdrop-blur-md",
        }
      default:
        return {
          label: status,
          className: "bg-gray-500/20 text-gray-100 border-gray-400/30 backdrop-blur-md",
        }
    }
  }

  const config = getStatusConfig(status)

  return <Badge className={`${config.className} font-medium px-3 py-1 rounded-2xl`}>{config.label}</Badge>
}

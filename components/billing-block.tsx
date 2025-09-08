import type React from "react"
import { MapPin, Phone, Mail } from "lucide-react"
import type { InvoiceAddress } from "@/types/invoice"
import { getAddressField } from "@/lib/invoice/adapter"

interface BillingBlockProps {
  title: string
  address?: InvoiceAddress
  icon?: React.ReactNode
}

export function BillingBlock({ title, address, icon }: BillingBlockProps) {
  if (!address) return null

  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
      <div className="flex items-center gap-2">
        {icon || <MapPin className="w-4 h-4 text-white/70" />}
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>

      <div className="space-y-1 text-sm text-white/80">
        {getAddressField(address.name) && <div className="font-medium">{address.name}</div>}
        {getAddressField(address.street1) && <div>{address.street1}</div>}
        {getAddressField(address.street2) && <div>{address.street2}</div>}
        {(() => {
          const city = getAddressField(address.city)
          const province = getAddressField(address.province)
          const postalCode = getAddressField(address.postalCode)
          return (city || province || postalCode) && (
            <div>{[city, province, postalCode].filter(Boolean).join(", ")}</div>
          )
        })()}
        {getAddressField(address.country) && <div>{address.country}</div>}

        {(() => {
          const phone = getAddressField(address.phone)
          const email = getAddressField(address.email)
          return (phone || email) && (
            <div className="pt-2 space-y-1">
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-white/60" />
                  <span>{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-white/60" />
                  <span>{email}</span>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

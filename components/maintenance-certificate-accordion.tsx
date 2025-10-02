"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FileText, Download } from "lucide-react"

interface MaintenanceCertificateAccordionProps {
  certificateUrl: string
}

export function MaintenanceCertificateAccordion({ certificateUrl }: MaintenanceCertificateAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!certificateUrl) return null

  const handleDownload = () => {
    // Open the certificate URL in a new tab for download
    window.open(certificateUrl, '_blank')
  }

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <Accordion type="single" collapsible className="w-full" onValueChange={(value) => setIsOpen(value === "certificate")}>
        <AccordionItem value="certificate" className="border-none">
          <AccordionTrigger className="px-4 py-3 text-white hover:bg-white/5 hover:no-underline transition-colors duration-200">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm">Maintenance Certificate</span>
              </div>
              {!isOpen && (
                <span className="text-sm text-emerald-300/80 font-normal line-clamp-2">
                  Your service has been completed by Comfort Hub and a Certificate of Maintenance has been issued...
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-white/80 text-sm leading-relaxed space-y-4">
              <p>
                Your service has been completed by Comfort Hub and a Certificate of Maintenance has been issued. This certificate confirms that your HVAC system was serviced according to manufacturer guidelines and industry best practices. It also includes your equipment details and warranty coverage information.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors duration-200 border border-emerald-400/30 hover:border-emerald-400/50"
              >
                <Download className="w-4 h-4" />
                Download Certificate
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

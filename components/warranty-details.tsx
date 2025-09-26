'use client';

import { InvoicePayload } from '@/types/invoice';
import { Shield, Package } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface WarrantyDetailsProps {
  invoice: InvoicePayload;
}

export function WarrantyDetails({ invoice }: WarrantyDetailsProps) {
  // Filter line items that have warranty years
  const warrantyItems = invoice.lineItems.filter(item => item.warrantyYears && item.warrantyYears > 0);

  // Don't render if no warranty items
  if (warrantyItems.length === 0) {
    return null;
  }

  const previewText = `${warrantyItems.length} item${warrantyItems.length === 1 ? '' : 's'} with warranty coverage`;

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="warranty" className="border-none">
          <AccordionTrigger className="px-4 py-3 text-white hover:bg-white/5 hover:no-underline transition-colors duration-200">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm text-white">Warranty Details</span>
              </div>
              <span className="text-sm text-emerald-300/80 font-normal">{previewText}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 border-t-0">
            <div className="space-y-3">
              {warrantyItems.map((item) => (
                <div 
                  key={item.lineIndex}
                  className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-emerald-500/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-slate-300" />
                        <span className="font-medium text-white text-sm">{item.sku}</span>
                      </div>
                      <div className="text-sm text-white/70 mb-2">
                        {item.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {item.warrantyYears} {item.warrantyYears === 1 ? 'Year' : 'Years'}
                      </div>
                      <div className="text-xs text-white/60">
                        Warranty
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Additional Info */}
              <div className="text-xs text-white/60 text-center pt-2">
                <p>Warranty terms and conditions apply. Please refer to manufacturer documentation for details.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

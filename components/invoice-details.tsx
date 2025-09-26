'use client';

import { InvoicePayload } from '@/types/invoice';
import { Package, List } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: InvoicePayload;
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-white/70" />
        <h3 className="font-semibold text-white text-sm">Invoice Details</h3>
      </div>

      {/* Line Items */}
      {invoice.lineItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-white/70" />
            <h4 className="font-medium text-white text-sm">Line Items</h4>
          </div>
          <div className="space-y-2">
            {invoice.lineItems.map((item) => (
              <div 
                key={item.lineIndex}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* SKU at top-left if it exists */}
                    {item.sku && (
                      <div className="mb-2">
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          SKU: {item.sku}
                        </span>
                      </div>
                    )}
                    {/* Description */}
                    <div className="mb-2">
                      <span className="font-medium text-white text-sm">{item.description}</span>
                    </div>
                    {/* Quantity and price info */}
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ${item.price.toFixed(2)}</span>
                      {item.taxAmount > 0 && (
                        <span>Tax: ${item.taxAmount.toFixed(2)}</span>
                      )}
                      {item.discountAmount > 0 && (
                        <span>Discount: ${item.discountAmount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* No items message */}
      {invoice.lineItems.length === 0 && (
        <div className="text-center py-8">
          <List className="h-8 w-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60">No line items found for this invoice</p>
        </div>
      )}
    </div>
  );
}

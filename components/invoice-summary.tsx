'use client';

import { InvoicePayload } from '@/types/invoice';
import { List, DollarSign, Calendar, FileText } from 'lucide-react';

interface InvoiceSummaryProps {
  invoice: InvoicePayload;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = invoice.tax.amount || 0;
  const discountAmount = invoice.discounts.amount || 0;
  const shippingAmount = invoice.shipping.amount || 0;
  const totalAmount = invoice.amount;

  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-white/70" />
        <h3 className="font-semibold text-white text-sm">Invoice Summary</h3>
      </div>

      {/* Invoice Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Invoice #: {invoice.invoiceNumber}</span>
          <span className="text-white font-medium">{invoice.type}</span>
        </div>
        
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Status: {invoice.status}</span>
          <span className="text-white font-medium">
            {invoice.amountPaid > 0 ? `$${invoice.amountPaid.toFixed(2)} Paid` : 'Unpaid'}
          </span>
        </div>

        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Date Created</span>
          <span>{new Date(invoice.dateCreated).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Discount</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Tax */}
        {taxAmount > 0 && (
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Tax</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Shipping */}
        {shippingAmount > 0 && (
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Shipping</span>
            <span>${shippingAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-white/20 pt-2 mt-2">
          {/* Total Amount */}
          <div className="flex items-center justify-between text-lg font-bold text-white">
            <span>Total Amount</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          {/* Amount Due */}
          {invoice.amountDue > 0 && (
            <div className="flex items-center justify-between text-sm font-medium text-yellow-300 mt-1">
              <span>Amount Due</span>
              <span>${invoice.amountDue.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-white/60 text-center pt-2">
        <p>All prices are in {invoice.currency.toUpperCase()}. {invoice.hasConvenienceFee ? 'Processing fee may apply.' : ''}</p>
      </div>
    </div>
  );
}

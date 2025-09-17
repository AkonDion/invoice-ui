'use client';

import { WorkOrder } from '@/types/workorder';
import { List, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/types/workorder';

interface WorkOrderTotalsPanelProps {
  workOrder: WorkOrder;
  totalAmount: number;
  totalDuration: number;
}

export function WorkOrderTotalsPanel({ 
  workOrder, 
  totalAmount, 
  totalDuration 
}: WorkOrderTotalsPanelProps) {
  // Use tax amount from work order data (already included in payload)
  const subtotal = workOrder.subTotal;
  const taxAmount = workOrder.taxAmount || 0;
  const totalWithTax = workOrder.grandTotal;

  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-white/70" />
        <h3 className="font-semibold text-white text-sm">Work Order Summary</h3>
      </div>

      {/* Work Order Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Work Order: {workOrder.workOrderName}</span>
          <span className="text-white font-medium">{workOrder.type}</span>
        </div>
        
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Status: {workOrder.status}</span>
          <span className="text-white font-medium">{workOrder.billingStatus}</span>
        </div>

        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Estimated Duration</span>
          <span>{Math.ceil((totalDuration || 0) / 60)} hours</span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-3">
        {/* Service Line Items Count */}
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Services ({workOrder.serviceLineItems.length})</span>
          <span>{formatCurrency(workOrder.serviceLineItems.reduce((sum, item) => sum + item.amount, 0))}</span>
        </div>

        {/* Part Line Items Count */}
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Parts ({workOrder.partLineItems.length})</span>
          <span>{formatCurrency(workOrder.partLineItems.reduce((sum, item) => sum + item.amount, 0))}</span>
        </div>

        <div className="border-t border-white/20 pt-2 mt-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Tax</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>

          <div className="border-t border-white/20 pt-2 mt-2">
            {/* Total Amount */}
            <div className="flex items-center justify-between text-lg font-bold text-white">
              <span>Total Amount</span>
              <span>{formatCurrency(totalWithTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-white/60 text-center pt-2">
        <p>All prices are in CAD. Tax included. Duration includes setup and cleanup time.</p>
      </div>
    </div>
  );
}

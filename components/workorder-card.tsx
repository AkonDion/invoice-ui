'use client';

import { WorkOrderPayload } from '@/types/workorder';
import { WorkOrderHeader } from './workorder-header';
import { WorkOrderDetails } from './workorder-details';
import { WorkOrderTotalsPanel } from './workorder-totals-panel';
import { WorkOrderActions } from './workorder-actions';

interface WorkOrderCardProps {
  workOrder: WorkOrderPayload;
  workOrderStatus?: string | string[] | undefined;
}

export function WorkOrderCard({ workOrder, workOrderStatus }: WorkOrderCardProps) {
  // Calculate totals for work order
  const totalAmount = workOrder.workOrder.grandTotal;
  const totalDuration = 480; // Default 8 hours for work orders

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <div className="space-y-6">
        {/* Header with contact info */}
        <WorkOrderHeader workOrder={workOrder.workOrder} />

        {/* Work Order Details - Line Items */}
        <WorkOrderDetails workOrder={workOrder.workOrder} />

        {/* Totals Panel */}
        <WorkOrderTotalsPanel 
          workOrder={workOrder.workOrder} 
          totalAmount={totalAmount}
          totalDuration={totalDuration}
        />

        {/* Actions */}
        <WorkOrderActions
          workOrder={workOrder.workOrder}
          workOrderStatus={workOrderStatus}
          workOrderToken={workOrder.token}
          isScheduled={workOrder.status === 'SCHEDULED'}
          scheduledDate={workOrder.scheduledDate}
        />
      </div>
    </div>
  );
}

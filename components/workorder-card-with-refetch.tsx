'use client';

import { useWorkOrderRefetch } from './workorder-refetch-provider';
import { WorkOrderCard } from './workorder-card';

interface WorkOrderCardWithRefetchProps {
  workOrderStatus?: string | string[] | undefined;
}

export function WorkOrderCardWithRefetch({ workOrderStatus }: WorkOrderCardWithRefetchProps) {
  const { workOrder, isLoading, error } = useWorkOrderRefetch();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading work order...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/40 shadow-xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Work Order</h2>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Work Order Not Found</h2>
          <p className="text-white/60">The requested work order could not be found.</p>
        </div>
      </div>
    );
  }

  return <WorkOrderCard workOrder={workOrder} workOrderStatus={workOrderStatus} />;
}






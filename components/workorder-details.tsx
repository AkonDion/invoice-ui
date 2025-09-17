'use client';

import { WorkOrder } from '@/types/workorder';
import { Package, Wrench, List, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/types/workorder';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetails({ workOrder }: WorkOrderDetailsProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-white/70" />
        <h3 className="font-semibold text-white text-sm">Work Order Details</h3>
      </div>

      {/* Service Line Items */}
      {workOrder.serviceLineItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-white/70" />
            <h4 className="font-medium text-white text-sm">Services</h4>
          </div>
          <div className="space-y-2">
            {workOrder.serviceLineItems.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white text-sm">{item.name}</span>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>Qty: {item.quantity} {item.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part Line Items */}
      {workOrder.partLineItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-white/70" />
            <h4 className="font-medium text-white text-sm">Parts & Materials</h4>
          </div>
          <div className="space-y-2">
            {workOrder.partLineItems.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white text-sm">{item.name}</span>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                        {item.partName}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>Qty: {item.quantity} {item.unit}</span>
                      <span>List: {formatCurrency(item.listPrice)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments */}
      {workOrder.appointments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-white/70" />
            <h4 className="font-medium text-white text-sm">Appointments</h4>
          </div>
          <div className="space-y-2">
            {workOrder.appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white text-sm">{appointment.name}</div>
                    <div className="text-xs text-white/60">
                      Service: {appointment.serviceAppointmentName}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No items message */}
      {workOrder.serviceLineItems.length === 0 && workOrder.partLineItems.length === 0 && (
        <div className="text-center py-8">
          <List className="h-8 w-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60">No line items found for this work order</p>
        </div>
      )}
    </div>
  );
}

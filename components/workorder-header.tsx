'use client';

import { WorkOrder } from '@/types/workorder';
import { User, Mail, Phone, MapPin, CreditCard, Wrench } from 'lucide-react';

interface WorkOrderHeaderProps {
  workOrder: WorkOrder;
}

export function WorkOrderHeader({ workOrder }: WorkOrderHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden">
            <img 
              src="/Vector (2).png" 
              alt="Company Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-white/80 text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Comfort Hub</span>
        </div>
      </div>

      {/* Title and Meta Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Work Order #{workOrder.workOrderName}</h1>
        </div>

        {/* Welcome Message */}
        <div className="text-sm text-white/80">
          <p>Hello {workOrder.contact.name}! 👋</p>
          <p>You can now schedule your work order appointment. Select your preferred time slot below to get started.</p>
        </div>
      </div>

      {/* Address Cards - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Address Card */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/70" />
            <h3 className="font-semibold text-white text-sm">Service Address</h3>
          </div>

          <div className="space-y-2 text-sm text-white/80">
            {/* Name */}
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-white/60" />
              <span className="font-medium">{workOrder.contact.name}</span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-white/60" />
              <span>{workOrder.contact.email}</span>
            </div>
            
            {/* Phone */}
            {workOrder.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-white/60" />
                <span>{workOrder.contact.phone}</span>
              </div>
            )}
            
            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-white/60 mt-0.5" />
              <div>
                <div>{workOrder.serviceAddress.street}</div>
                <div>{workOrder.serviceAddress.city}, {workOrder.serviceAddress.state} {workOrder.serviceAddress.postal}</div>
                <div>{workOrder.serviceAddress.country}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address Card */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white/70" />
            <h3 className="font-semibold text-white text-sm">Billing Address</h3>
          </div>

          <div className="space-y-2 text-sm text-white/80">
            {/* Name */}
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-white/60" />
              <span className="font-medium">{workOrder.contact.name}</span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-white/60" />
              <span>{workOrder.contact.email}</span>
            </div>
            
            {/* Phone */}
            {workOrder.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-white/60" />
                <span>{workOrder.contact.phone}</span>
              </div>
            )}
            
            {/* Address */}
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-white/60 mt-0.5" />
              <div>
                <div>{workOrder.billingAddress.street}</div>
                <div>{workOrder.billingAddress.city}, {workOrder.billingAddress.state} {workOrder.billingAddress.postal}</div>
                <div>{workOrder.billingAddress.country}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Order Details Card */}
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-white/70" />
          <h3 className="font-semibold text-white text-sm">Work Order Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-white/80">
          <div>
            <span className="text-white/60">Work Order ID:</span>
            <div className="font-medium">{workOrder.workOrderName}</div>
          </div>
          <div>
            <span className="text-white/60">Type:</span>
            <div className="font-medium">{workOrder.type}</div>
          </div>
          <div>
            <span className="text-white/60">Status:</span>
            <div className="font-medium">{workOrder.status}</div>
          </div>
          <div>
            <span className="text-white/60">Billing Status:</span>
            <div className="font-medium">{workOrder.billingStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

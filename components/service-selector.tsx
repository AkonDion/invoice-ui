'use client';

import { Service } from '@/types/booking';
import { ServiceCard } from './service-card';
import { Card } from './ui/card';
import { Clock, DollarSign, CheckCircle, Info } from 'lucide-react';

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
}

export function ServiceSelector({ 
  services, 
  selectedServices, 
  onServiceToggle
}: ServiceSelectorProps) {
  const selectedServiceIds = selectedServices.map(s => s.id);

  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white/70" />
          <h3 className="font-semibold text-white text-sm">Available Services</h3>
        </div>
        <div className="text-white/60 text-xs">
          {selectedServices.length > 0 ? '1 service selected' : 'No service selected'}
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No services available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            // Separate services into missing asset and regular services
            const missingAssetServices = services.filter(service => service.isMissingAsset);
            const regularServices = services.filter(service => !service.isMissingAsset);
            
            // Combine them with regular services first (left side), then missing asset services (right side)
            const orderedServices = [...regularServices, ...missingAssetServices];
            
            return orderedServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              
              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={isSelected}
                  onToggle={() => onServiceToggle(service)}
                />
              );
            });
          })()}
        </div>
      )}

      {/* Missing Asset Services Explanation */}
      {services.some(service => service.isMissingAsset) && (
        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-400/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-teal-300 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-teal-100/90 leading-relaxed">
              <p className="font-medium text-teal-50 mb-1">About Missing Asset Services</p>
              <p>
                Services marked "MISSING ASSET" indicate that the required equipment is not yet recorded in our system. 
                You can still book these services—we will create a temporary asset, and our technician will complete 
                the full details (Make, Model, Serial, Date of Manufacturing) during your appointment. Accurate 
                record-keeping ensures our technicians are fully prepared to service and maintain your equipment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80">Selected Services:</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3 text-white/60" />
                <span className="text-white font-medium">
                  ${selectedServices.reduce((total, s) => total + s.price, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-white/60" />
                <span className="text-white font-medium">
                  {selectedServices.reduce((total, s) => total + s.duration, 0)} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

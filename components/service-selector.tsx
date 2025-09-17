'use client';

import { Service } from '@/types/booking';
import { ServiceCard } from './service-card';
import { Card } from './ui/card';
import { Clock, DollarSign, CheckCircle } from 'lucide-react';

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
          {selectedServices.length} of {services.length} selected
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No services available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            
            return (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={isSelected}
                onToggle={() => onServiceToggle(service)}
              />
            );
          })}
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

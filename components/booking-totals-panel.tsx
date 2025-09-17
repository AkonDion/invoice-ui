'use client';

import { Service } from '@/types/booking';
import { DollarSign, Clock, List } from 'lucide-react';
import { formatDuration } from '@/types/booking';

interface BookingTotalsPanelProps {
  selectedServices: Service[];
  totalAmount: number;
  totalDuration: number;
}

export function BookingTotalsPanel({ 
  selectedServices, 
  totalAmount, 
  totalDuration 
}: BookingTotalsPanelProps) {
  // Calculate totals using tax values from database
  const subtotal = totalAmount;
  const totalTax = selectedServices.reduce((total, service) => total + service.tax, 0);
  const totalWithTax = subtotal + totalTax;

  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-white/70" />
        <h3 className="font-semibold text-white text-sm">Booking Summary</h3>
      </div>

      {/* Booking Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Booking Type: Service Booking</span>
          <span className="text-white font-medium">Active</span>
        </div>
        
        <div className="flex items-center justify-between text-white/80 text-sm">
          <span>Estimated Duration</span>
          <span>{Math.ceil((totalDuration || 0) / 60)} hours</span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-3">
        {/* Selected Services List */}
        <div className="space-y-2">
          {selectedServices.map((service) => (
            <div 
              key={service.id}
              className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white text-sm">{service.name}</span>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                      {service.category || 'Service'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(service.duration || 60)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    ${service.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 pt-2 mt-2">
          {/* Services Count */}
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Services ({selectedServices.length})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="border-t border-white/20 pt-2 mt-2">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>Tax</span>
              <span>${totalTax.toFixed(2)}</span>
            </div>

            <div className="border-t border-white/20 pt-2 mt-2">
              {/* Total Amount */}
              <div className="flex items-center justify-between text-lg font-bold text-white">
                <span>Total Amount</span>
                <span>${totalWithTax.toFixed(2)}</span>
              </div>
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

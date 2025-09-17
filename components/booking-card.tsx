'use client';

import { useState } from 'react';
import { BookingPayload, Service } from '@/types/booking';
import { BookingHeader } from './booking-header';
import { ServiceSelector } from './service-selector';
import { BookingTotalsPanel } from './booking-totals-panel';
import { BookingActions } from './booking-actions';

interface BookingCardProps {
  booking: BookingPayload;
  bookingStatus?: string | string[] | undefined;
}

export function BookingCard({ booking, bookingStatus }: BookingCardProps) {
  const [selectedServices, setSelectedServices] = useState<Service[]>(booking.selectedServices);

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    let newSelectedServices: Service[];

    if (isSelected) {
      // Remove service
      newSelectedServices = selectedServices.filter(s => s.id !== service.id);
    } else {
      // Add service
      newSelectedServices = [...selectedServices, service];
    }

    setSelectedServices(newSelectedServices);
  };

  // Calculate totals
  const subtotal = selectedServices.reduce((total, service) => total + (service.price || 0), 0);
  const totalDuration = selectedServices.reduce((total, service) => total + (service.duration || 60), 0);
  const totalTax = selectedServices.reduce((total, service) => total + (service.tax || 0), 0);
  const totalAmount = subtotal + totalTax;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <div className="space-y-6">
        {/* Header with contact info */}
        <BookingHeader contact={booking.contact} />

        {/* Service Selection */}
        <ServiceSelector
          services={booking.services}
          selectedServices={selectedServices}
          onServiceToggle={handleServiceToggle}
        />

        {/* Totals Panel */}
        {selectedServices.length > 0 && (
          <BookingTotalsPanel
            selectedServices={selectedServices}
            totalAmount={subtotal}
            totalDuration={totalDuration}
          />
        )}

        {/* Actions */}
        <BookingActions
          selectedServices={selectedServices}
          totalAmount={totalAmount}
          totalDuration={totalDuration}
          bookingStatus={bookingStatus}
          bookingToken={booking.token}
          isScheduled={booking.status === 'SCHEDULED'}
          scheduledDate={booking.scheduledDate}
        />
      </div>
    </div>
  );
}

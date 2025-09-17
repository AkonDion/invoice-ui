'use client';

import { Service } from '@/types/booking';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { CalendarAvailability } from './calendar-availability';
import { CalendarSlot } from '@/types/calendar';

interface BookingActionsProps {
  selectedServices: Service[];
  totalAmount: number;
  totalDuration: number;
  bookingStatus?: string | string[] | undefined;
  bookingToken: string;
  isScheduled?: boolean;
  scheduledDate?: string;
}

export function BookingActions({ 
  selectedServices, 
  totalAmount, 
  totalDuration, 
  bookingStatus,
  bookingToken,
  isScheduled = false,
  scheduledDate
}: BookingActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isScheduledLocal, setIsScheduledLocal] = useState(false);

  // Function to format arrival window for bookings
  const formatArrivalWindow = (startTime: string) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
    
    const startFormatted = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const endFormatted = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const handleScheduleBooking = async () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service to continue.');
      return;
    }

    if (!selectedSlot) {
      alert('Please select a date and time for your booking.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save selected services first
      const updateResponse = await fetch('/api/booking/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: bookingToken,
          selectedServices: selectedServices.map(s => s.id),
          notes: notes
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to save booking selection');
      }

      // Then schedule the booking (this locks it)
      const scheduleResponse = await fetch('/api/booking/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: bookingToken,
          scheduledDate: selectedSlot.start,
          notes: notes
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error('Failed to schedule booking');
      }

      const result = await scheduleResponse.json();

      // Send webhook notification
      try {
        await fetch('https://nodechain.dev/webhook/d4f57f3f-dd70-4776-843e-a3ec4f56a003', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Standardized section
            scheduledDate: selectedSlot.start,
            arrivalWindow: formatArrivalWindow(selectedSlot.start),
            contactId: result.booking.contact_id,
            bookingType: 'service_booking',
            
            // Booking-specific details
            bookingDetails: {
              bookingId: result.booking.id,
              booking: result.booking,
              start: selectedSlot.start,
              notes: notes,
              timestamp: new Date().toISOString()
            }
          }),
        });
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
        // Don't fail the entire operation if webhook fails
      }

      // Show success state
      setIsScheduledLocal(true);
    } catch (error) {
      console.error('Error scheduling booking:', error);
      alert('Failed to schedule booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Show success message if booking was completed or scheduled
  if (bookingStatus === 'success' || isScheduled || isScheduledLocal) {
    const displayArrivalWindow = scheduledDate ? formatArrivalWindow(scheduledDate) : (selectedSlot ? formatArrivalWindow(selectedSlot.start) : '');

    return (
      <div className="p-4 rounded-2xl bg-green-500/20 backdrop-blur-md border border-green-500/40">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white">Booking Scheduled!</h3>
            <p className="text-green-200 mt-2">
              Your service booking has been successfully scheduled.
            </p>
            {displayArrivalWindow && (
              <p className="text-green-100 mt-2 font-medium">
                Arrival Window: {displayArrivalWindow}
              </p>
            )}
            <p className="text-green-200/80 text-sm mt-2">
              This booking is now locked and cannot be modified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">Ready to Schedule?</h3>
        <p className="text-white/80 text-sm">
          {selectedServices.length > 0 
            ? `You've selected ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} for $${totalAmount.toFixed(2)}`
            : 'Select services above to continue'
          }
        </p>
      </div>

      {/* Calendar Selection */}
      {selectedServices.length > 0 && (
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-2">Select Your Preferred Arrival Window</h4>
            <p className="text-white/70 text-sm">
              Choose a 2-hour arrival window that works best for you. Our team will arrive within this window and contact you when they're on their way.
            </p>
          </div>
          <CalendarAvailability
            bookingType="booking"
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
            isScheduled={isScheduled}
            scheduledDate={scheduledDate}
          />
        </div>
      )}

      {/* Notes */}
      {selectedServices.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
          <label className="block text-white/80 text-sm font-medium">
            Notes (optional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific instructions or details for the service team..."
            rows={3}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none"
          />
        </div>
      )}

      {/* Action Button */}
      {selectedServices.length > 0 ? (
        <div className="flex justify-center">
          <button
            onClick={handleScheduleBooking}
            disabled={isSubmitting || !selectedSlot}
            className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white border-0 h-12 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Scheduling...' : 'Schedule Booking'}
            </div>
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60">Please select services to continue</p>
        </div>
      )}

      {/* Booking Info */}
      {selectedServices.length > 0 && (
        <div className="text-center text-sm text-white/60 space-y-1">
          <p>Estimated duration: {Math.ceil((totalDuration || 0) / 60)} hours</p>
          <p>You'll receive an email confirming your appointment details</p>
        </div>
      )}
    </div>
  );
}

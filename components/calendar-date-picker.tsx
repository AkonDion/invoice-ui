'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CalendarSlot, CalendarBookingType, groupSlotsByDate, formatDateForDisplay, formatTimeForDisplay, getAvailableSlots, sortSlotsByTime } from '@/types/calendar';

interface CalendarDatePickerProps {
  bookingType: CalendarBookingType;
  selectedSlot?: CalendarSlot | null;
  onSlotSelect: (slot: CalendarSlot | null) => void;
  className?: string;
  isScheduled?: boolean;
  scheduledDate?: string;
}

export function CalendarDatePicker({ 
  bookingType, 
  selectedSlot, 
  onSlotSelect, 
  className = '',
  isScheduled = false,
  scheduledDate
}: CalendarDatePickerProps) {
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [bookingType]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/calendar/availability?type=${bookingType}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch availability');
      }

      const data = await response.json();
      setSlots(data.availability || []);
    } catch (err) {
      console.error('Error fetching calendar availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setIsLoading(false);
    }
  };

  const groupedSlots = groupSlotsByDate(slots);
  const availableSlots = getAvailableSlots(slots);
  const availableDates = Object.keys(groupedSlots).filter(date => 
    groupedSlots[date].some(slot => slot.status === 'available')
  );

  const handleSlotSelect = (slot: CalendarSlot) => {
    onSlotSelect(slot);
    setIsOpen(false);
  };

  // Show scheduled appointment if already scheduled
  if (isScheduled && scheduledDate) {
    const formatScheduledDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <div className={`w-full ${className}`}>
        <div className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Scheduled:</span>
          </div>
          <span className="text-sm">{formatScheduledDate(scheduledDate)}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white/60">
          <span>Loading available times...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200">
          <span>Error loading availability</span>
          <button
            onClick={fetchAvailability}
            className="text-red-300 hover:text-red-100 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white/60">
          <span>No available times</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            {selectedSlot 
              ? `${formatDateForDisplay(selectedSlot.date)} at ${formatTimeForDisplay(selectedSlot)}`
              : 'Select date and time'
            }
          </span>
        </div>
        <Clock className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {availableDates.slice(0, 7).map((date) => {
              const dateSlots = sortSlotsByTime(getAvailableSlots(groupedSlots[date]));
              
              return (
                <div key={date} className="space-y-2">
                  <div className="text-sm font-medium text-white/80 border-b border-white/20 pb-1">
                    {formatDateForDisplay(date)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {dateSlots.slice(0, 6).map((slot) => {
                      const isSlotSelected = selectedSlot?.start === slot.start;
                      
                      return (
                        <button
                          key={slot.start}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-2 rounded text-sm transition-all duration-200 ${
                            isSlotSelected
                              ? 'bg-green-500/30 border-green-500/60 text-green-100'
                              : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                          } border`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeForDisplay(slot)}</span>
                            {isSlotSelected && <CheckCircle className="w-3 h-3 text-green-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

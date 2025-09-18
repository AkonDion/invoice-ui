'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CalendarSlot, CalendarBookingType, groupSlotsByDate, formatDateForDisplay, formatTimeForDisplay, getAvailableSlots, sortSlotsByTime } from '@/types/calendar';

interface CalendarAvailabilityProps {
  bookingType: CalendarBookingType;
  selectedSlot?: CalendarSlot | null;
  onSlotSelect: (slot: CalendarSlot | null) => void;
  className?: string;
  isScheduled?: boolean;
  scheduledDate?: string;
}

export function CalendarAvailability({ 
  bookingType, 
  selectedSlot, 
  onSlotSelect, 
  className = '',
  isScheduled = false,
  scheduledDate
}: CalendarAvailabilityProps) {
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weeksToShow, setWeeksToShow] = useState(1);
  const [showAllDates, setShowAllDates] = useState(true);

  // Function to format arrival window
  const formatArrivalWindow = (slot: CalendarSlot) => {
    const start = new Date(slot.start);
    const end = new Date(start.getTime() + (bookingType === 'booking' ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000)); // Add 2 hours for booking, 1 hour for workorders
    
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

  // Function to format work duration (8 hours from start time)
  const formatWorkDuration = (slot: CalendarSlot) => {
    const start = new Date(slot.start);
    const end = new Date(start.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for work duration
    
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

  // Group dates by week and limit to weeksToShow
  const datesByWeek = availableDates.reduce((weeks, date, index) => {
    const weekIndex = Math.floor(index / 7);
    if (!weeks[weekIndex]) {
      weeks[weekIndex] = [];
    }
    weeks[weekIndex].push(date);
    return weeks;
  }, [] as string[][]);

  const visibleWeeks = datesByWeek.slice(0, weeksToShow);
  const hasMoreWeeks = datesByWeek.length > weeksToShow;

  const handleDateSelect = (date: string) => {
    // If we're in focused mode and this is the selected date, don't toggle
    if (!showAllDates && selectedSlot?.date === date) {
      return;
    }
    
    setSelectedDate(selectedDate === date ? null : date);
    onSlotSelect(null); // Clear slot selection when changing date
  };

  const handleSlotSelect = (slot: CalendarSlot) => {
    onSlotSelect(slot);
    // Hide all other dates and show only the selected one
    setShowAllDates(false);
    setSelectedDate(slot.date);
    setWeeksToShow(1);
  };

  const handleShowMore = () => {
    setWeeksToShow(prev => prev + 1);
  };

  const handleChangeTime = () => {
    setShowAllDates(true);
    setSelectedDate(null);
    onSlotSelect(null);
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
      <div className={`p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-white/80" />
          <h3 className="text-lg font-semibold text-white">Scheduled Appointment</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#00D6AF]/10 border border-[#00D6AF]/30">
            <div className="flex items-center gap-2 text-[#00D6AF]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Scheduled Time:</span>
            </div>
            <p className="text-white mt-1">
              {formatScheduledDate(scheduledDate)}
            </p>
          </div>
          
          {bookingType === 'workorders' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-500/10 backdrop-blur-md border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-200">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Arrival Window:</span>
                </div>
                <p className="text-blue-100 mt-1">
                  {formatArrivalWindow({ start: scheduledDate, end: new Date(new Date(scheduledDate).getTime() + 60 * 60 * 1000).toISOString() } as CalendarSlot)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 backdrop-blur-md border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-200">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Time on Site:</span>
                </div>
                <p className="text-blue-100 mt-1">
                  {formatWorkDuration({ start: scheduledDate, end: new Date(new Date(scheduledDate).getTime() + 8 * 60 * 60 * 1000).toISOString() } as CalendarSlot)}
                </p>
              </div>
            </div>
          )}

          <div className="text-center text-white/60 text-sm">
            This appointment is locked and cannot be modified.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading available times...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/40 shadow-xl ${className}`}>
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Availability</h3>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={fetchAvailability}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className={`p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
        <div className="text-center">
          <Calendar className="w-8 h-8 text-white/40 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-white mb-2">No Available Times</h3>
          <p className="text-white/60">There are currently no available time slots for {bookingType}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-white/80" />
        <h3 className="text-lg font-semibold text-white">
          Available {bookingType === 'booking' ? 'Arrival Windows' : 'Time Slots'}
        </h3>
        <span className="text-sm text-white/60">
          ({availableSlots.length} {bookingType === 'booking' ? 'windows' : 'slots'})
        </span>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-center gap-2 text-blue-200 mb-1">
          <Clock className="w-4 h-4" />
          <span className="font-medium text-sm">
            {bookingType === 'booking' ? 'Arrival Windows' : 'Time Information'}
          </span>
        </div>
        <p className="text-blue-100 text-sm">
          {bookingType === 'booking' 
            ? 'Each time slot represents a 2-hour arrival window. Our team will arrive within this window and contact you when they\'re on their way.'
            : 'Each time slot shows estimated time on site. Our team will arrive within a 1-hour window and contact you when they\'re on their way.'
          }
        </p>
      </div>

      <div className="space-y-4">
        {visibleWeeks.map((weekDates, weekIndex) => (
          <div key={weekIndex} className="space-y-3">
            {/* Week Header */}
            <div className="text-sm font-medium text-white/60 border-b border-white/20 pb-2">
              Week {weekIndex + 1}
            </div>
            
            {/* Week Dates */}
            <div className="space-y-2">
              {weekDates.map((date) => {
                const dateSlots = sortSlotsByTime(getAvailableSlots(groupedSlots[date]));
                const isDateSelected = selectedDate === date;
                const isSelectedDate = selectedSlot?.date === date;
                
                // Show all dates if showAllDates is true, or only the selected date if false
                if (!showAllDates && !isSelectedDate) {
                  return null;
                }
                
                return (
                  <div key={date} className="space-y-2">
                    <button
                      onClick={() => handleDateSelect(date)}
                      className={`w-full p-3 rounded-lg transition-all duration-200 ${
                        isDateSelected
                          ? 'bg-[#00D6AF]/20 border-[#00D6AF]/40 text-[#00D6AF]'
                          : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                      } border`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formatDateForDisplay(date)}</span>
                        <span className="text-sm opacity-75">
                          {dateSlots.length} {bookingType === 'booking' ? 'arrival window' : 'time slot'}{dateSlots.length !== 1 ? 's' : ''} available
                        </span>
                      </div>
                    </button>

                    {isDateSelected && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                        {dateSlots.map((slot) => {
                          const isSlotSelected = selectedSlot?.start === slot.start;
                          
                          return (
                            <button
                              key={slot.start}
                              onClick={() => handleSlotSelect(slot)}
                              className={`p-3 rounded-lg transition-all duration-200 ${
                                isSlotSelected
                                  ? 'bg-[#00D6AF]/30 border-[#00D6AF]/60 text-white'
                                  : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                              } border`}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <div className="text-left">
                                  <div className="font-medium">{formatTimeForDisplay(slot)}</div>
                                  <div className="text-xs opacity-75">
                                    {bookingType === 'booking' ? 'Arrival Window' : 'Time on Site'}
                                  </div>
                                </div>
                                {isSlotSelected && <CheckCircle className="w-4 h-4 text-[#00D6AF]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Show More Button */}
        {hasMoreWeeks && showAllDates && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleShowMore}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 rounded-lg transition-all duration-200 hover:border-white/30"
            >
              Show More Weeks ({datesByWeek.length - weeksToShow} remaining)
            </button>
          </div>
        )}

        {/* Change Time Button */}
        {!showAllDates && selectedSlot && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleChangeTime}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 rounded-lg transition-all duration-200 hover:border-white/30"
            >
              Change Time
            </button>
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-lg bg-white/10 border border-white/30">
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Selected {bookingType === 'booking' ? 'Arrival Window' : 'Time Slot'}:
              </span>
            </div>
            <p className="text-white/70 mt-1">
              {formatDateForDisplay(selectedSlot.date)} at {formatTimeForDisplay(selectedSlot)}
            </p>
          </div>
          
          {bookingType === 'workorders' && (
            <div className="p-4 rounded-lg bg-blue-500/10 backdrop-blur-md border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-200">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Arrival Window:</span>
              </div>
              <p className="text-blue-100 mt-1">
                {formatArrivalWindow(selectedSlot)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

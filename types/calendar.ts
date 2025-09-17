import { z } from 'zod';

// Calendar availability slot schema
export const calendarSlotSchema = z.object({
  date: z.string(), // e.g., "Tue Sep 16 2025"
  label: z.string().optional(), // e.g., "8:00-10:00" (optional for workorders)
  start: z.string(), // ISO datetime string
  end: z.string(), // ISO datetime string
  status: z.enum(['available', 'unavailable', 'booked']),
});

// Calendar availability response schema
export const calendarAvailabilitySchema = z.array(calendarSlotSchema);

// TypeScript types
export type CalendarSlot = z.infer<typeof calendarSlotSchema>;
export type CalendarAvailability = z.infer<typeof calendarAvailabilitySchema>;

// Calendar booking type
export type CalendarBookingType = 'booking' | 'workorders';

// Utility functions
export function groupSlotsByDate(slots: CalendarSlot[]): Record<string, CalendarSlot[]> {
  return slots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, CalendarSlot[]>);
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTimeForDisplay(slot: CalendarSlot): string {
  if (slot.label) {
    // Convert 24-hour format label to 12-hour format
    // e.g., "8:00-10:00" -> "8:00 AM-10:00 AM", "14:00-16:00" -> "2:00 PM-4:00 PM"
    const [startTime, endTime] = slot.label.split('-');
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(startTime)}-${formatTime(endTime)}`;
  }
  
  // For workorders without label, format from start/end times
  const startTime = new Date(slot.start).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const endTime = new Date(slot.end).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${startTime}-${endTime}`;
}

export function isSlotAvailable(slot: CalendarSlot): boolean {
  return slot.status === 'available';
}

export function getAvailableSlots(slots: CalendarSlot[]): CalendarSlot[] {
  return slots.filter(isSlotAvailable);
}

export function sortSlotsByTime(slots: CalendarSlot[]): CalendarSlot[] {
  return slots.sort((a, b) => {
    const timeA = a.start;
    const timeB = b.start;
    return timeA.localeCompare(timeB);
  });
}

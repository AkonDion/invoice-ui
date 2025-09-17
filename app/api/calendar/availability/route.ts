import { NextRequest, NextResponse } from 'next/server';
import { calendarAvailabilitySchema, CalendarBookingType, CalendarSlot } from '@/types/calendar';

const CALENDAR_WEBHOOK_URL = 'https://nodechain.dev/webhook/4905f161-d220-4ea5-91cc-9b64f159e924';

// Convert timezone from +04:00 to Toronto time (EDT/EST)
function convertToTorontoTime(slot: CalendarSlot): CalendarSlot {
  // Parse the start and end times
  const startDate = new Date(slot.start);
  const endDate = new Date(slot.end);
  
  // Convert from UTC to Toronto time
  // Toronto is UTC-4 (EDT) or UTC-5 (EST)
  // Since we're in September, it's EDT (UTC-4)
  // Original: 08:00:00.000Z (UTC) = 4:00 AM EDT, but we want 8:00 AM EDT
  // So we need to add 4 hours to get 8:00 AM - 4:00 PM EDT
  const offsetDifference = 4 * 60; // +4 hours in minutes
  
  // Apply the offset
  const torontoStart = new Date(startDate.getTime() + (offsetDifference * 60 * 1000));
  const torontoEnd = new Date(endDate.getTime() + (offsetDifference * 60 * 1000));
  
  // Format back to ISO string with Toronto timezone
  const formatToTorontoISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Determine if it's EDT or EST based on the date
    // For simplicity, we'll use EDT (-04:00) for now
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-04:00`;
  };
  
  return {
    ...slot,
    start: formatToTorontoISO(torontoStart),
    end: formatToTorontoISO(torontoEnd),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Validate the booking type
    if (!type || (type !== 'booking' && type !== 'workorders')) {
      return NextResponse.json(
        { error: 'Invalid booking type. Must be "booking" or "workorders"' },
        { status: 400 }
      );
    }

    // Fetch availability from the external webhook
    const response = await fetch(CALENDAR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error(`Calendar API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Validate the response data
    const validatedData = calendarAvailabilitySchema.parse(data);

    // Convert timezone to Toronto time
    const convertedData = validatedData.map(convertToTorontoTime);

    return NextResponse.json({
      success: true,
      type,
      availability: convertedData,
      count: convertedData.length,
    });
  } catch (error) {
    console.error('Calendar availability error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch calendar availability' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as CalendarBookingType;

  if (!type || (type !== 'booking' && type !== 'workorders')) {
    return NextResponse.json(
      { error: 'Invalid booking type. Must be "booking" or "workorders"' },
      { status: 400 }
    );
  }

  try {
    // Fetch availability from the external webhook
    const response = await fetch(CALENDAR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error(`Calendar API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Validate the response data
    const validatedData = calendarAvailabilitySchema.parse(data);

    // Convert timezone to Toronto time
    const convertedData = validatedData.map(convertToTorontoTime);

    return NextResponse.json({
      success: true,
      type,
      availability: convertedData,
      count: convertedData.length,
    });
  } catch (error) {
    console.error('Calendar availability error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch calendar availability' },
      { status: 500 }
    );
  }
}

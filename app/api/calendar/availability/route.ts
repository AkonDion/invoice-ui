import { NextRequest, NextResponse } from 'next/server';
import { calendarAvailabilitySchema, CalendarBookingType, CalendarSlot } from '@/types/calendar';

const CALENDAR_WEBHOOK_URL = 'https://nodechain.dev/webhook/4905f161-d220-4ea5-91cc-9b64f159e924';

// Convert "fake UTC" times (which are actually Toronto local times) to proper UTC
function convertToTorontoTime(slot: CalendarSlot): CalendarSlot {
  // Parse the times that are marked as UTC but are actually Toronto local time
  const startDate = new Date(slot.start);
  const endDate = new Date(slot.end);
  
  // The webhook returns times that should be treated as Toronto local time
  // but they're marked as UTC. We need to add 4 hours to get the correct UTC time
  // that when converted to Toronto time will show the correct local time.
  const torontoOffset = 4 * 60; // +4 hours in minutes (Toronto is UTC-4 in EDT)
  
  // Apply the offset to convert from "fake UTC" to real UTC
  const realUtcStart = new Date(startDate.getTime() + (torontoOffset * 60 * 1000));
  const realUtcEnd = new Date(endDate.getTime() + (torontoOffset * 60 * 1000));
  
  // Format back to ISO string
  return {
    ...slot,
    start: realUtcStart.toISOString(),
    end: realUtcEnd.toISOString(),
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

    // Convert times from "fake UTC" (which are actually Toronto local times) to proper UTC
    const convertedData = validatedData.map(slot => convertToTorontoTime(slot));

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

    // Convert times from "fake UTC" (which are actually Toronto local times) to proper UTC
    const convertedData = validatedData.map(slot => convertToTorontoTime(slot));

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

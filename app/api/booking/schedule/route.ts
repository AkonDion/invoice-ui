import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Use SERVICE ROLE on the server so RLS doesn't block reads/writes
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const { token, scheduledDate, notes } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      );
    }

    // Use the scheduled date as-is since no timezone conversion is applied
    const finalScheduledDate = scheduledDate;

    // Validate that booking session exists and is active
    const { data: bookingSession, error: sessionError } = await supabase
      .from('booking_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !bookingSession) {
      return NextResponse.json(
        { error: 'Booking session not found' },
        { status: 404 }
      );
    }

    if (bookingSession.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Booking session is not active' },
        { status: 400 }
      );
    }

    // Check if booking session is expired
    if (new Date(bookingSession.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('booking_sessions')
        .update({ status: 'EXPIRED' })
        .eq('token', token);
      
      return NextResponse.json(
        { error: 'Booking session has expired' },
        { status: 410 }
      );
    }

    // Update booking session to SCHEDULED status
    const updateData: any = {
      status: 'SCHEDULED',
      scheduled_date: finalScheduledDate
    };
    
    if (notes !== undefined && notes !== '') {
      updateData.notes = notes;
    }
    
    const { data: updatedSession, error: updateError } = await supabase
      .from('booking_sessions')
      .update(updateData)
      .eq('token', token)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to schedule booking session:', updateError);
      return NextResponse.json(
        { error: 'Failed to schedule booking session' },
        { status: 500 }
      );
    }

    console.log('✅ Booking session scheduled:', {
      token,
      scheduledDate: finalScheduledDate,
      hasNotes: !!notes
    });

    return NextResponse.json({ 
      success: true,
      booking: updatedSession
    });

  } catch (error) {
    console.error('Error scheduling booking session:', error);
    return NextResponse.json(
      { error: 'Failed to schedule booking session' },
      { status: 500 }
    );
  }
}

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

    // Validate that work order session exists and is active
    const { data: workOrderSession, error: sessionError } = await supabase
      .from('workorders')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !workOrderSession) {
      return NextResponse.json(
        { error: 'Work order session not found' },
        { status: 404 }
      );
    }

    if (workOrderSession.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Work order session is not active' },
        { status: 400 }
      );
    }

    // Check if work order session is expired
    if (new Date(workOrderSession.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('workorders')
        .update({ status: 'EXPIRED' })
        .eq('token', token);
      
      return NextResponse.json(
        { error: 'Work order session has expired' },
        { status: 410 }
      );
    }

    // Update work order session to SCHEDULED status
    const { data: updatedSession, error: updateError } = await supabase
      .from('workorders')
      .update({
        status: 'SCHEDULED',
        scheduled_date: scheduledDate,
        notes: notes || null
      })
      .eq('token', token)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to schedule work order session:', updateError);
      return NextResponse.json(
        { error: 'Failed to schedule work order session' },
        { status: 500 }
      );
    }

    console.warn('✅ Work order session scheduled:', {
      token,
      scheduledDate,
      hasNotes: !!notes
    });

    return NextResponse.json({ 
      success: true,
      workOrder: updatedSession
    });

  } catch (error) {
    console.error('Error scheduling work order session:', error);
    return NextResponse.json(
      { error: 'Failed to schedule work order session' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token, scheduledDate, notes } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Update work order session
    const { data, error } = await supabase
      .from('workorders')
      .update({
        scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        notes: notes || null
      })
      .eq('token', token)
      .select();

    if (error) {
      console.error('Error updating work order:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to update work order', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      workOrder: data[0] 
    });

  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json(
      { error: 'Failed to update work order' },
      { status: 500 }
    );
  }
}

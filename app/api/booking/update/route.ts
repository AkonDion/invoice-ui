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
    const { token, selectedServices, missingAssetServices, scheduledDate, notes } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

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

    // Validate selected services if provided
    if (selectedServices && Array.isArray(selectedServices)) {
      // Define the three standard maintenance services
      const standardServiceIds = [
        "24404000000853158", // ROUTINE SYSTEM MAINTENANCE
        "24404000000853155", // ROUTINE CONDENSER MAINTENANCE  
        "24404000000853156"  // ROUTINE FURNACE MAINTENANCE
      ];

      // Verify all selected services exist in the standard services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .in('id', selectedServices)
        .in('fsm_id', standardServiceIds);

      if (servicesError || !services || services.length !== selectedServices.length) {
        return NextResponse.json(
          { error: 'Invalid service selection' },
          { status: 400 }
        );
      }
    }

    // Validate missing asset services if provided
    if (missingAssetServices && Array.isArray(missingAssetServices)) {
      // Define the three standard maintenance services
      const standardServiceIds = [
        "24404000000853158", // ROUTINE SYSTEM MAINTENANCE
        "24404000000853155", // ROUTINE CONDENSER MAINTENANCE  
        "24404000000853156"  // ROUTINE FURNACE MAINTENANCE
      ];

      // Verify all missing asset services exist in the standard services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .in('id', missingAssetServices)
        .in('fsm_id', standardServiceIds);

      if (servicesError || !services || services.length !== missingAssetServices.length) {
        return NextResponse.json(
          { error: 'Invalid missing asset service selection' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (selectedServices !== undefined) {
      updateData.selected_services = selectedServices;
    }

    if (missingAssetServices !== undefined) {
      updateData.missing_asset_services = missingAssetServices;
    }

    if (scheduledDate !== undefined && scheduledDate !== '') {
      updateData.scheduled_date = scheduledDate;
    }

    if (notes !== undefined && notes !== '') {
      updateData.notes = notes;
    }

    // Update booking session
    const { data: updatedSession, error: updateError } = await supabase
      .from('booking_sessions')
      .update(updateData)
      .eq('token', token)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update booking session:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking session' },
        { status: 500 }
      );
    }

    console.log('✅ Booking session updated:', {
      token,
      selectedServices: selectedServices?.length || 0,
      missingAssetServices: missingAssetServices?.length || 0,
      scheduledDate,
      hasNotes: !!notes
    });

    return NextResponse.json({ 
      success: true,
      booking: updatedSession
    });

  } catch (error) {
    console.error('Error updating booking session:', error);
    return NextResponse.json(
      { error: 'Failed to update booking session' },
      { status: 500 }
    );
  }
}

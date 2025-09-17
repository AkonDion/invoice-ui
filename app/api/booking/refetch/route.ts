import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { bookingPayloadSchema, calculateTotalAmount, calculateTotalDuration } from '@/types/booking';

export const dynamic = 'force-dynamic';

// Use SERVICE ROLE on the server so RLS doesn't block reads/writes
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl!, supabaseServiceRole!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Debug: Log the Supabase client configuration
    console.warn('🔧 Booking Refetch - Supabase client config:', {
      url: supabaseUrl?.substring(0, 30) + '...',
      hasServiceRole: !!supabaseServiceRole,
      serviceRoleLength: supabaseServiceRole?.length
    });

    // Fetch fresh booking session data
    const { data: bookingSession, error: sessionError } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (sessionError || !bookingSession) {
      console.error("Booking session refetch error:", sessionError);
      return NextResponse.json({ error: 'Booking session not found' }, { status: 404 });
    }

    // Check if booking session is expired
    if (new Date(bookingSession.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from("booking_sessions")
        .update({ status: 'EXPIRED' })
        .eq("token", token);
      
      return NextResponse.json({ error: 'Booking session expired' }, { status: 410 });
    }

    // Fetch contact information (using customers table)
    const { data: contact, error: contactError } = await supabase
      .from("customers")
      .select("*")
      .eq("contactid", bookingSession.contact_id)
      .single();

    if (contactError || !contact) {
      console.error("Contact fetch error:", contactError);
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Fetch all available services for all FSM IDs
    const { data: allServices, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .in("fsm_id", bookingSession.fsm_id) // fsm_id is now an array
      .order("name");

    if (servicesError || !allServices) {
      console.error("Services fetch error:", servicesError);
      return NextResponse.json({ error: 'Services not found' }, { status: 404 });
    }

    // Map services to our expected format
    const mappedServices = allServices.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: parseFloat(service.unit_price || '0'),
      tax: parseFloat(service.tax || '0'),
      duration: 60, // Default 1 hour duration since not in your schema
      fsm_id: service.fsm_id,
      category: service.type || '',
      is_active: true,
      created_at: service.created_at,
      updated_at: service.created_at
    }));

    // Get selected services based on selected_services array
    const selectedServices = mappedServices.filter(service => 
      bookingSession.selected_services.includes(service.id)
    );

    // Calculate totals
    const totalAmount = calculateTotalAmount(selectedServices);
    const totalDuration = calculateTotalDuration(selectedServices);

    // Map contact to our expected format
    const mappedContact = {
      id: contact.contactid,
      name: contact.contactname || 'Unknown Customer',
      email: contact.contactemail || '',
      phone: contact.contactphone || '',
      address: contact.contactaddress || '',
      city: '',
      province: '',
      postal_code: '',
      country: '',
      created_at: contact.created_at || new Date().toISOString(),
      updated_at: contact.updated_at || new Date().toISOString()
    };

    // Build booking payload
    const bookingPayload = {
      token: bookingSession.token,
      contact: mappedContact,
      services: mappedServices,
      fsmId: bookingSession.fsm_id,
      status: bookingSession.status,
      selectedServices,
      totalAmount,
      totalDuration,
      scheduledDate: bookingSession.scheduled_date ?? undefined,
      notes: bookingSession.notes ?? undefined,
      expiresAt: bookingSession.expires_at
    };

    // Validate the payload
    const validatedPayload = bookingPayloadSchema.parse(bookingPayload);

    // Debug: Log the fresh data from database
    console.warn('🔄 Booking Refetch - Fresh booking data from DB:', {
      status: bookingSession.status,
      selectedServicesCount: selectedServices.length,
      totalAmount,
      totalDuration,
      expiresAt: bookingSession.expires_at,
      contactName: contact.name
    });

    return NextResponse.json({ 
      booking: validatedPayload,
      success: true 
    });

  } catch (error) {
    console.error('❌ Error refetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to refetch booking data' },
      { status: 500 }
    );
  }
}

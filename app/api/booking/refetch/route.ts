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

    // Define the three standard maintenance services
    const standardServiceIds = [
      "24404000000853158", // ROUTINE SYSTEM MAINTENANCE
      "24404000000853155", // ROUTINE CONDENSER MAINTENANCE  
      "24404000000853156"  // ROUTINE FURNACE MAINTENANCE
    ];

    // Fetch all available services for all FSM IDs
    const { data: availableServices, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .in("fsm_id", bookingSession.fsm_id) // fsm_id is now an array
      .order("name");

    if (servicesError || !availableServices) {
      console.error("Services fetch error:", servicesError);
      return NextResponse.json({ error: 'Services not found' }, { status: 404 });
    }

    // Fetch all standard services (regardless of fsm_id)
    const { data: allStandardServices, error: standardServicesError } = await supabase
      .from("services")
      .select("*")
      .in("fsm_id", standardServiceIds)
      .order("name");

    if (standardServicesError || !allStandardServices) {
      console.error("Standard services fetch error:", standardServicesError);
      return NextResponse.json({ error: 'Standard services not found' }, { status: 404 });
    }

    // Create a map of available services by fsm_id for quick lookup
    const availableServicesMap = new Map();
    availableServices.forEach(service => {
      availableServicesMap.set(service.fsm_id, service);
    });

    // Map all standard services, marking missing assets appropriately
    const mappedServices = allStandardServices.map(service => {
      const isAvailable = availableServicesMap.has(service.fsm_id);
      const serviceData = isAvailable ? availableServicesMap.get(service.fsm_id) : service;
      
      return {
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description || '',
        price: parseFloat(serviceData.unit_price || '0'),
        tax: parseFloat(serviceData.tax || '0'),
        duration: 60, // Default 1 hour duration since not in your schema
        fsm_id: serviceData.fsm_id,
        category: serviceData.type || '',
        is_active: true,
        created_at: serviceData.created_at,
        updated_at: serviceData.created_at,
        isMissingAsset: !isAvailable
      };
    });

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

    const response = NextResponse.json({ 
      booking: validatedPayload,
      success: true 
    });
    
    // Add cache-busting headers to prevent browser caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())
    
    return response;

  } catch (error) {
    console.error('❌ Error refetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to refetch booking data' },
      { status: 500 }
    );
  }
}

import type { BookingPayload } from "@/types/booking";
import { createClient } from "@supabase/supabase-js";
import { BookingRefetchProvider } from "@/components/booking-refetch-provider";
import { BookingCardWithRefetch } from "@/components/booking-card-with-refetch";

interface BookingPageProps {
  params: { token: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function getBookingData(token: string): Promise<BookingPayload> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  // Fetch booking session
  const { data: bookingSession, error: sessionError } = await supabase
    .from("booking_sessions")
    .select("*")
    .eq("token", token)
    .single();

  if (sessionError || !bookingSession) {
    console.error("Booking session fetch error:", sessionError);
    throw new Error("Unable to load booking session");
  }

  // Check if booking session is expired
  if (new Date(bookingSession.expires_at) < new Date()) {
    throw new Error("Booking session has expired");
  }

  // Fetch contact information (using customers table)
  const { data: contact, error: contactError } = await supabase
    .from("customers")
    .select("*")
    .eq("contactid", bookingSession.contact_id)
    .single();

  if (contactError || !contact) {
    console.error("Contact fetch error:", contactError);
    throw new Error("Unable to load contact information");
  }

  // Fetch all available services for this FSM
  const { data: allServices, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .eq("fsm_id", bookingSession.fsm_id)
    .order("name");

  if (servicesError || !allServices) {
    console.error("Services fetch error:", servicesError);
    throw new Error("Unable to load services");
  }

  // Map services to our expected format
  const mappedServices = allServices.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description || '',
    price: parseFloat(service.unit_price || '0'),
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
  const totalAmount = selectedServices.reduce((total, service) => total + service.price, 0);
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);

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

  const booking: BookingPayload = {
    token: bookingSession.token,
    contact: mappedContact,
    services: mappedServices,
    fsmId: bookingSession.fsm_id,
    status: bookingSession.status,
    selectedServices,
    totalAmount,
    totalDuration
  };

  return booking;
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const bookingStatus = searchParams?.status;

  return (
    <BookingRefetchProvider token={params.token}>
      <BookingPageContent bookingStatus={bookingStatus} />
    </BookingRefetchProvider>
  );
}

function BookingPageContent({ bookingStatus }: { bookingStatus?: string | string[] }) {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative flex flex-col items-center min-h-[100dvh] px-4 pt-8 pb-24 md:pb-8 space-y-4">
        {bookingStatus === 'success' && (
          <div
            role="alert"
            className="w-full max-w-md rounded bg-green-100 p-4 text-green-800"
          >
            Booking scheduled successfully. Thank you!
          </div>
        )}
        {bookingStatus === 'cancelled' && (
          <div
            role="alert"
            className="w-full max-w-md rounded bg-yellow-100 p-4 text-yellow-800"
          >
            Booking scheduling cancelled.
          </div>
        )}
        <BookingCardWithRefetch bookingStatus={bookingStatus} />
      </div>
    </div>
  );
}

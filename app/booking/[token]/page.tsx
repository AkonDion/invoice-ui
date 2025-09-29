import { BookingRefetchProvider } from "@/components/booking-refetch-provider";
import { BookingCardWithRefetch } from "@/components/booking-card-with-refetch";

interface BookingPageProps {
  params: { token: string };
  searchParams?: { [key: string]: string | string[] | undefined };
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

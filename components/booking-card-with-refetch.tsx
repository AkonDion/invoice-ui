'use client';

import { useBookingRefetch } from './booking-refetch-provider';
import { BookingCard } from './booking-card';

interface BookingCardWithRefetchProps {
  bookingStatus?: string | string[] | undefined;
}

export function BookingCardWithRefetch({ bookingStatus }: BookingCardWithRefetchProps) {
  const { booking, isLoading, error } = useBookingRefetch();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading booking...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/40 shadow-xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Booking</h2>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
          <p className="text-white/60">The requested booking could not be found.</p>
        </div>
      </div>
    );
  }

  return <BookingCard booking={booking} bookingStatus={bookingStatus} />;
}

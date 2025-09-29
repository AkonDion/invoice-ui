'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BookingPayload } from '@/types/booking';

interface BookingRefetchContextType {
  booking: BookingPayload | null;
  isLoading: boolean;
  error: string | null;
  refetchBooking: () => Promise<void>;
}

const BookingRefetchContext = createContext<BookingRefetchContextType | undefined>(undefined);

interface BookingRefetchProviderProps {
  children: ReactNode;
  token: string;
}

export function BookingRefetchProvider({ children, token }: BookingRefetchProviderProps) {
  const [booking, setBooking] = useState<BookingPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchBooking = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use API route with cache-busting parameters
      const timestamp = Date.now()
      const response = await fetch(`/api/booking/refetch?token=${encodeURIComponent(token)}&_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refetch when component mounts
  useEffect(() => {
    refetchBooking();
  }, [token]);

  // Listen for focus events to refetch when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      refetchBooking();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  return (
    <BookingRefetchContext.Provider
      value={{
        booking,
        isLoading,
        error,
        refetchBooking,
      }}
    >
      {children}
    </BookingRefetchContext.Provider>
  );
}

export function useBookingRefetch() {
  const context = useContext(BookingRefetchContext);
  if (context === undefined) {
    throw new Error('useBookingRefetch must be used within a BookingRefetchProvider');
  }
  return context;
}

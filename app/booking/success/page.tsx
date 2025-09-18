'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get booking details from URL params
  const bookingId = searchParams.get('bookingId');
  const totalAmount = searchParams.get('totalAmount');
  const totalDuration = searchParams.get('totalDuration');
  const contactEmail = searchParams.get('contactEmail');

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-green-500/20 to-green-500/10 backdrop-blur-md border border-green-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="flex flex-col items-center space-y-6">
            {/* Success Icon */}
            <div className="p-4 rounded-full bg-[#00D6AF]/20 border border-[#00D6AF]/30">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>

            {/* Success Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Booking Confirmed!
              </h1>
              <p className="text-green-200 text-lg">
                Your service booking has been successfully scheduled.
              </p>
            </div>

            {/* Booking Details */}
            <div className="w-full space-y-4">
              <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  {bookingId && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Booking ID:</span>
                      <span className="text-white font-mono">{bookingId}</span>
                    </div>
                  )}
                  {totalAmount && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Total Amount:</span>
                      <span className="text-white font-semibold">${totalAmount}</span>
                    </div>
                  )}
                  {totalDuration && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Duration:</span>
                      <span className="text-white">{totalDuration} minutes</span>
                    </div>
                  )}
                  {contactEmail && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Confirmation sent to:</span>
                      <span className="text-white">{contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="w-full p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                What's Next?
              </h3>
              <div className="space-y-2 text-sm text-white/80">
                <p>• You'll receive a confirmation email shortly</p>
                <p>• Our team will contact you within 24 hours to confirm the exact time and date</p>
                <p>• We'll send you a reminder 24 hours before your scheduled service</p>
                <p>• If you need to reschedule, please contact us at least 24 hours in advance</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={() => router.push('/')}
                className="flex-1 bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white border-0"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Book Another Service
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                Print Confirmation
              </Button>
            </div>

            {/* Contact Info */}
            <div className="text-center text-green-200/80 text-sm">
              <p>Questions? Contact us at support@comforthub.ca</p>
              <p className="mt-1">or call (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white/60" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}



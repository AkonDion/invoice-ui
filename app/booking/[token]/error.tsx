'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get error details from URL params or use defaults
  const errorMessage = searchParams.get('message') || 'An error occurred while loading your booking session';
  const errorCode = searchParams.get('code');
  const token = searchParams.get('token');

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-red-500/20 to-red-500/10 backdrop-blur-md border border-red-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="flex flex-col items-center space-y-6">
            {/* Error Icon */}
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>

            {/* Error Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Booking Error
              </h1>
              <p className="text-red-200 text-lg">
                {errorMessage}
              </p>
            </div>

            {/* Error Details */}
            {(errorCode || token) && (
              <div className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="space-y-2 text-sm text-red-200">
                  {errorCode && (
                    <div className="flex justify-between">
                      <span className="font-medium">Error Code:</span>
                      <span className="font-mono">{errorCode}</span>
                    </div>
                  )}
                  {token && (
                    <div className="flex justify-between">
                      <span className="font-medium">Booking Token:</span>
                      <span className="font-mono text-xs">{token}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-red-200/80 text-sm">
              <p>If this problem persists, please contact support.</p>
              <p className="mt-1">Error ID: {Date.now().toString(36)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white/60" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}



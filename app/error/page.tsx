'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get error details from URL params
  const errorMessage = searchParams.get('message') || 'An error occurred during payment processing';
  const errorCode = searchParams.get('code');
  const invoiceNumber = searchParams.get('invoiceNumber');
  const transactionId = searchParams.get('transactionId');

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-red-500/20 to-red-500/10 backdrop-blur-md border border-red-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="flex flex-col items-center space-y-8">
            <Image 
              src="/Vector (2).png" 
              alt="ComfortHub Icon" 
              width={64}
              height={64}
              className="opacity-70 drop-shadow-lg"
            />
            
            <div className="rounded-full bg-red-500/20 p-6 border border-red-500/20">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Payment Failed
              </h1>
              <div className="h-px w-24 bg-red-500/20 my-2 mx-auto" />
              
              <div className="space-y-4">
                <p className="text-lg text-white/70">
                  {errorMessage}
                </p>
                
                {/* Error Details */}
                <div className="space-y-3 bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                  {errorCode && (
                    <p className="text-white/60">
                      Error Code: <span className="text-white">{errorCode}</span>
                    </p>
                  )}
                  {invoiceNumber && (
                    <p className="text-white/60">
                      Invoice: <span className="text-white">{invoiceNumber}</span>
                    </p>
                  )}
                  {transactionId && (
                    <p className="text-white/60">
                      Transaction ID: <span className="text-white">{transactionId}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.back()}
                    className="w-full py-3 px-4 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                  >
                    Try Again
                  </button>
                  
                  <a
                    href="mailto:support@comforthub.ca"
                    className="w-full py-3 px-4 bg-transparent hover:bg-white/5 border border-white/20 rounded-xl text-white/70 font-medium transition-all duration-200 text-center"
                  >
                    Contact Support
                  </a>

                  <p className="text-sm text-white/40 text-center mt-4">
                    Need help? Our support team is available 24/7 at support@comforthub.ca
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

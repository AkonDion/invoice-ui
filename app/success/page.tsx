'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get transaction details from URL params
  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const invoiceNumber = searchParams.get('invoiceNumber');
  const paymentType = searchParams.get('paymentType');
  const email = searchParams.get('email');
  const status = searchParams.get('status');

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="flex flex-col items-center space-y-8">
            <Image 
              src="/Vector (2).png" 
              alt="ComfortHub Icon" 
              width={64}
              height={64}
              className="opacity-70 drop-shadow-lg"
            />
            
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-white">
                {paymentType === 'ACH' ? 'Payment Initiated' : 'Payment Successful'}
              </h1>
              <div className="h-px w-24 bg-white/20 my-2 mx-auto" />
              
              <div className="space-y-4">
                {paymentType === 'ACH' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-lg text-white/70">
                        Thank you for your payment. Your ACH transfer has been initiated successfully.
                      </p>
                      <div className="space-y-2">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                          <p className="text-yellow-400/90">
                            ACH transfers typically take 3-5 business days to complete. We will send a payment confirmation and updated invoice to {email} once the transfer is finalized.
                          </p>
                        </div>
                        {status === 'PENDING' && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                            <p className="text-yellow-400/90">
                              Transfer Status: Pending Bank Verification
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-lg text-white/70">
                      Thank you for your payment. Your transaction has been completed successfully.
                    </p>
                    {email && (
                      <div className="flex items-center gap-2 text-white/60 bg-white/5 px-4 py-3 rounded-lg border border-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>We've sent the payment receipt and updated invoice to {email}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Transaction Details */}
                <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl border border-white/20 overflow-hidden">
                  {invoiceNumber && (
                    <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                      <span className="text-white/60">Invoice</span>
                      <span className="text-white font-medium">{invoiceNumber}</span>
                    </div>
                  )}
                  {transactionId && (
                    <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                      <span className="text-white/60">Transaction ID</span>
                      <span className="text-white font-medium">{transactionId}</span>
                    </div>
                  )}
                  {amount && (
                    <div className="px-4 py-3 bg-white/5 flex justify-between items-center">
                      <span className="text-white/60">Amount</span>
                      <span className="text-white font-medium">${amount}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.back()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                >
                  Return to Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
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
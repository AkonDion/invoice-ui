'use client';

import { useRouter } from 'next/navigation';

export default function TestPages() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="flex flex-col space-y-8">
            <h1 className="text-4xl font-bold text-white text-center">
              Test Payment Pages
            </h1>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push('/success?transactionId=TEST123&amount=150.00&invoiceNumber=INV001&paymentType=CREDIT_CARD&status=APPROVED&email=test@example.com')}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500/20 to-green-500/10 hover:from-green-500/30 hover:to-green-500/20 border border-green-500/20 rounded-xl text-white font-medium transition-all duration-200"
              >
                View Credit Card Success
              </button>

              <button
                onClick={() => router.push('/success?transactionId=TEST123&amount=150.00&invoiceNumber=INV001&paymentType=ACH&status=PENDING&email=test@example.com')}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 hover:from-yellow-500/30 hover:to-yellow-500/20 border border-yellow-500/20 rounded-xl text-white font-medium transition-all duration-200"
              >
                View ACH Pending
              </button>

              <button
                onClick={() => router.push('/error?message=Test%20payment%20error&code=TEST_ERROR&invoiceNumber=INV001')}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 border border-red-500/20 rounded-xl text-white font-medium transition-all duration-200"
              >
                View Error Page
              </button>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <h2 className="text-white/70 font-medium">Test Parameters:</h2>
                <div className="space-y-1 text-sm">
                  <p className="text-white/60">Transaction ID: TEST123</p>
                  <p className="text-white/60">Amount: $150.00</p>
                  <p className="text-white/60">Invoice: INV001</p>
                  <p className="text-white/60">Error Code: TEST_ERROR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

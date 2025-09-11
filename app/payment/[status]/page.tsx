'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface PaymentPageProps {
  params: { status: 'success' | 'error' | 'pending' };
  searchParams: { 
    amount?: string;
    currency?: string;
    invoice?: string;
    type?: 'CREDIT_CARD' | 'ACH';
  };
}

export default function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const router = useRouter();
  const { status } = params;
  const { amount, currency, invoice, type } = searchParams;

  const content = {
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-400" />,
      title: "Payment Approved",
      message: type === 'CREDIT_CARD' 
        ? "Your credit card payment has been processed successfully."
        : "Your ACH payment has been initiated successfully.",
      containerClass: "bg-gradient-to-b from-white/20 to-white/10",
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-400" />,
      title: "Payment Declined",
      message: "Your payment could not be processed. Please try again or use a different payment method.",
      containerClass: "bg-gradient-to-b from-red-500/20 to-red-500/5",
    },
    pending: {
      icon: <Clock className="w-12 h-12 text-blue-400" />,
      title: "Payment Pending",
      message: "Your ACH payment is being processed. This may take 3-5 business days to complete.",
      containerClass: "bg-gradient-to-b from-white/20 to-white/10",
    }
  }[status];

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 {content.containerClass}">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
            <Image 
              src="/Vector (2).png" 
              alt="ComfortHub Icon" 
              width={64}
              height={64}
              className="opacity-70 drop-shadow-lg"
            />
            <div className="rounded-full bg-white/10 p-6 border border-white/20">
              {content.icon}
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-medium text-white">{content.title}</h2>
              {amount && currency && (
                <div className="text-3xl font-bold text-white">
                  CA${amount}
                </div>
              )}
              {invoice && (
                <p className="text-white/70">Invoice #{invoice}</p>
              )}
              <p className="text-white/80">{content.message}</p>
              <button 
                onClick={() => router.push(`/invoice/${invoice}`)}
                className="px-6 py-2 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                Return to Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

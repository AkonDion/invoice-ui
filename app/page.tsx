'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        {status === 'idle' && (
          <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              <Image 
                src="/Vector (2).png" 
                alt="ComfortHub Icon" 
                width={64}
                height={64}
                className="opacity-70 drop-shadow-lg"
              />
              <h1 className="text-4xl font-bold text-white text-center">
                Invoice Access Required
              </h1>
              <div className="h-px w-24 bg-white/20 my-2" />
              <div className="space-y-8 w-full max-w-md">
                <div className="space-y-4">
                  <p className="text-lg text-white/70 text-center">
                    To view your invoice, you'll need an active token link. These links are typically sent to your email when an invoice is generated.
                  </p>
                  <p className="text-sm text-white/50 text-center">
                    Your token should look like: invoice/8ae016...
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="h-px w-full bg-white/10" />
                  <p className="text-base text-white/70 text-center">
                    Lost your invoice link?
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all duration-200"
                    />
                    <button 
                      onClick={async () => {
                        try {
                          setStatus('loading');
                          const response = await fetch('/api/request-invoice', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                          });
                          
                          const data = await response.json();
                          
                          if (data.found) {
                            setStatus('success');
                            setMessage(`Invoice #${data.invoice_number} found! We've sent the invoice link to ${data.email}`);
                          } else {
                            setStatus('error');
                            setMessage('No invoice found for this email. Please contact us at billing@comforthub.ca for assistance.');
                          }
                        } catch (error) {
                          setStatus('error');
                          setMessage('Something went wrong. Please try again later.');
                        }
                      }}
                      disabled={!email}
                      className="w-full py-3 px-4 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request New Invoice Link
                    </button>
                    <p className="text-sm text-white/40 text-center">
                      We'll check our records and send the invoice link to your email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
              <Image 
                src="/Vector (2).png" 
                alt="ComfortHub Icon" 
                width={64}
                height={64}
                className="opacity-70 drop-shadow-lg animate-pulse"
              />
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white/60" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-medium text-white">Checking Email</h2>
                <p className="text-white/70">Looking for your invoice...</p>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
              <div className="rounded-full bg-white/10 p-6 border border-white/20">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-medium text-white">Invoice Found!</h2>
                <p className="text-green-400/90">{message}</p>
                <div className="flex items-center justify-center gap-2 text-white/60 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Check your email for the invoice link</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-red-500/20 to-red-500/5 backdrop-blur-md border border-red-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
              <div className="rounded-full bg-red-500/20 p-6">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-medium text-white">No Invoice Found</h2>
                <p className="text-red-400">{message}</p>
                <button 
                  onClick={() => {
                    setStatus('idle');
                    setMessage('');
                    setEmail('');
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

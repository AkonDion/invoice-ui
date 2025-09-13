"use client"

import Image from 'next/image'
import { RefreshCw } from "lucide-react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
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
            
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-white">
                Invoice Error
              </h1>
              <div className="h-px w-24 bg-red-500/20 my-2 mx-auto" />
              
              <div className="space-y-4">
                <p className="text-lg text-white/70">
                  We encountered an error while loading this invoice. This might be a temporary issue.
                </p>
                
                {/* Error Details */}
                <div className="bg-gradient-to-b from-red-500/10 to-red-500/5 rounded-xl border border-red-500/20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-red-500/10 flex justify-between items-center">
                    <span className="text-white/60">Error Type</span>
                    <span className="text-white font-medium">Invoice Loading Failed</span>
                  </div>
                  <div className="px-4 py-3 bg-red-500/5 flex justify-between items-center">
                    <span className="text-white/60">Status</span>
                    <span className="text-white font-medium">Temporary Error</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={reset}
                    className="w-full py-3 px-4 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 inline" />
                    Try Again
                  </button>
                  
                  <a
                    href="mailto:support@comforthub.ca"
                    className="w-full py-3 px-4 bg-transparent hover:bg-white/5 border border-white/20 rounded-xl text-white/70 font-medium transition-all duration-200 text-center"
                  >
                    Contact Support
                  </a>

                  <p className="text-sm text-white/40 text-center mt-4">
                    Need help? Contact our support team at support@comforthub.ca
                  </p>
                </div>

                {/* Development Error Details */}
                {process.env.NODE_ENV === "development" && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-white/70 hover:text-white text-sm">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-black/20 rounded-lg text-xs text-red-300 overflow-auto">
                      <div className="space-y-1">
                        <div><strong>Error:</strong> {error.message}</div>
                        {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
                        <div><strong>Stack:</strong></div>
                        <pre className="text-xs mt-1 whitespace-pre-wrap">{error.stack}</pre>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

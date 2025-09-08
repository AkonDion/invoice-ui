"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen relative pb-20 md:pb-0">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/gradient-background.jpg)",
        }}
      />

      {/* Error Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-400/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
              <p className="text-white/70">
                We encountered an error while loading this invoice. This might be a temporary issue.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={reset}
                className="bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <div className="text-sm text-white/50">
                <p>If the problem persists, please contact support.</p>
                {process.env.NODE_ENV === "development" && (
                  <details className="mt-2 text-left">
                    <summary className="cursor-pointer text-white/70 hover:text-white">
                      Error Details
                    </summary>
                    <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-red-300 overflow-auto">
                      {error.message}
                      {error.digest && `\nDigest: ${error.digest}`}
                    </pre>
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

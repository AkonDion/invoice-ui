export default function Loading() {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] py-8 px-4 space-y-6">
        <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col items-center space-y-6">
            {/* Loading Spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white/60" />
            
            {/* Loading Text */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Loading Your Booking
              </h2>
              <p className="text-white/80">
                Please wait while we load your booking session...
              </p>
            </div>

            {/* Loading Dots Animation */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




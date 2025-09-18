// Simple, fast loading component that shows immediately
export default function Loading() {
  return (
    <div className="min-h-[100dvh] relative pb-20 md:pb-0">
      {/* Background Image - Match the invoice page */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/Grid%202.png)",
        }}
      />

      {/* Simple Loading Spinner */}
      <div className="relative z-10 flex items-center justify-center min-h-[100dvh] p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading invoice...</p>
        </div>
      </div>
    </div>
  )
}

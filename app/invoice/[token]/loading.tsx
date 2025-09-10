export default function Loading() {
  return (
    <div className="min-h-[100dvh] relative pb-20 md:pb-0">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/gradient-background.jpg)",
        }}
      />

      {/* Loading Skeleton */}
      <div className="relative z-10 flex items-center min-h-[100dvh] p-4">
        <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 animate-pulse" />
                  <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-white/20 rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-48 h-8 bg-white/20 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-white/20 rounded-xl animate-pulse" />
                  <div className="w-16 h-8 bg-white/20 rounded-xl animate-pulse" />
                </div>
                
                <div className="flex gap-4">
                  <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Two Column Layout Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Contact Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/10 space-y-3">
                    <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-40 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-28 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 space-y-3">
                    <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-40 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-28 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Totals */}
              <div className="lg:col-span-1">
                <div className="p-4 rounded-2xl bg-white/10 space-y-3">
                  <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="w-16 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-20 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-20 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-16 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-12 h-3 bg-white/20 rounded animate-pulse" />
                      <div className="w-24 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                    <div className="border-t border-white/20 pt-2">
                      <div className="flex justify-between">
                        <div className="w-12 h-4 bg-white/20 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-white/20 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-20 h-5 bg-white/20 rounded animate-pulse" />
                      <div className="w-24 h-5 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Skeleton */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <div className="w-20 h-4 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-16 h-3 bg-white/20 rounded animate-pulse" />
                    <div className="w-32 h-3 bg-white/20 rounded animate-pulse" />
                    <div className="w-8 h-3 bg-white/20 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-white/20 rounded animate-pulse" />
                    <div className="w-20 h-3 bg-white/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pay Now Bar Skeleton */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="w-20 h-3 bg-white/20 rounded animate-pulse mb-2" />
                  <div className="w-24 h-5 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="w-24 h-12 bg-white/20 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

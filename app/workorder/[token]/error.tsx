'use client';

export default function Error() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/40 shadow-xl">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Work Order</h2>
        <p className="text-red-200">There was an error loading the work order. Please try again.</p>
      </div>
    </div>
  );
}


'use client'

import { InvoiceCard } from "@/components/invoice-card";
import { useInvoiceRefetch } from "@/components/invoice-refetch-provider";

export function InvoiceCardWithRefetch() {
  const { invoice } = useInvoiceRefetch();
  
  if (!invoice) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="h-4 bg-white/10 rounded mb-2"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return <InvoiceCard invoice={invoice} />;
}

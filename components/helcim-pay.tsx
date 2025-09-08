"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { money } from '@/lib/invoice/adapter'
import type { InvoicePayload } from '@/types/invoice'
import { isPaid } from '@/types/invoice'

interface HelcimPayProps {
  invoice: InvoicePayload
  className?: string
}

declare global {
  interface Window {
    appendHelcimPayIframe: (checkoutToken: string) => void
  }
}

export function HelcimPay({ invoice, className = "" }: HelcimPayProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load HelcimPay script and set up message listener
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js'
    script.async = true
    script.onload = () => {
      setIsInitialized(true)
    }
    script.onerror = (error) => {
      console.error('Failed to load HelcimPay script:', error)
      setError('Failed to load HelcimPay script. Please check your internet connection.')
    }
    document.head.appendChild(script)

    // Set up message listener for HelcimPay responses
    const HELCIM_ORIGIN = 'https://secure.helcim.app'

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== HELCIM_ORIGIN) return
      if (event.data?.eventName && event.data.eventName.startsWith('helcim-pay-js-')) {
        if (event.data.eventStatus === 'ABORTED') {
          console.error('Transaction failed!', event.data.eventMessage)
          setError('Payment was cancelled or failed. Please try again.')
          setIsLoading(false)
        }

        if (event.data.eventStatus === 'SUCCESS') {
          // Payment successful, reload the page to show updated status
          window.location.reload()
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      // Cleanup script and event listener on unmount
      const existingScript = document.querySelector('script[src="https://secure.helcim.app/helcim-pay/services/start.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const handlePayNow = async () => {
    if (!isInitialized) {
      setError('HelcimPay is still loading, please wait...')
      return
    }

    // Check if HelcimPay is available
    if (!window.appendHelcimPayIframe) {
      setError('HelcimPay is not available. Please refresh the page and try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare customer information from billing address
      const customerInfo = {
        name: invoice.billingAddress.name || '',
        businessName: '', // You might want to add this to your invoice data
        email: invoice.billingAddress.email || '',
        phone: invoice.billingAddress.phone || '',
        street1: invoice.billingAddress.street1 || '',
        street2: invoice.billingAddress.street2 || '',
        city: invoice.billingAddress.city || '',
        province: invoice.billingAddress.province || '',
        country: invoice.billingAddress.country || 'CA',
        postalCode: invoice.billingAddress.postalCode || '',
      }

      // Call our API to initialize payment
      const response = await fetch('/api/helcim/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: {
            ...invoice,
            hasConvenienceFee: invoice.hasConvenienceFee,
          },
          customerInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Payment initialization failed:', data)
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Initialize HelcimPay with the checkout token
      // The HelcimPay.js library will handle the modal display automatically
      try {
        window.appendHelcimPayIframe(data.checkoutToken)
      } catch (iframeError) {
        console.error('HelcimPay iframe error:', iframeError)
        throw new Error('Unable to open payment modal. Please try again.')
      }

    } catch (error) {
      console.error('Payment initialization error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show pay button if already paid
  if (isPaid(invoice)) {
    return (
      <div className={`p-4 rounded-2xl bg-green-500/20 backdrop-blur-md border border-green-400/30 ${className}`}>
        <div className="text-center">
          <div className="text-green-100 font-semibold mb-2">Invoice Paid</div>
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-2xl">
            Download Receipt
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-white/70 text-sm">Amount Due</div>
          <div className="text-white font-bold text-lg">{money(invoice.amountDue, invoice.currency)}</div>
          {error && (
            <div className="text-red-300 text-xs mt-1">{error}</div>
          )}
        </div>
        <Button
          onClick={handlePayNow}
          disabled={isLoading || !isInitialized}
          className="bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00D6AF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : !isInitialized ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

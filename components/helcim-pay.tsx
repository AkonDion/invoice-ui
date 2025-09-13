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
  const [currentCheckoutToken, setCurrentCheckoutToken] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Load HelcimPay script
  useEffect(() => {
    const src = 'https://secure.helcim.app/helcim-pay/services/start.js'
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      setIsInitialized(true)
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => setIsInitialized(true)
    script.onerror = (err) => {
      console.error('Failed to load HelcimPay script:', err)
      setError('Failed to load HelcimPay script. Please check your internet connection.')
    }
    document.head.appendChild(script)

    return () => {
      // Optional cleanup on unmount
      // (Leaving the script in place avoids re-downloads if you navigate back)
    }
  }, [])

  // Message listener — attach ONLY after we have a checkout token
  useEffect(() => {
    if (!currentCheckoutToken) return

    const HELCIM_ORIGIN = 'https://secure.helcim.app'
    const expectedEventName = `helcim-pay-js-${currentCheckoutToken}`

    const handleMessage = (event: MessageEvent) => {
      // Ignore non-Helcim origins
      if (event.origin !== HELCIM_ORIGIN) return

      const { eventName, eventStatus, eventMessage } = (event.data || {}) as {
        eventName?: string
        eventStatus?: 'SUCCESS' | 'ABORTED' | 'HIDE' | boolean
        eventMessage?: unknown
      }

      // Debug
      console.warn('🔍 Received message event:', {
        origin: event.origin,
        eventName,
        eventStatus,
        expectedEventName,
        currentCheckoutToken,
        fullEventData: event.data
      })

      // Only enforce token match for transactional statuses
      if (eventName !== expectedEventName) return

      console.warn('✅ Event matches our checkout token!')

      if (eventStatus === 'ABORTED') {
        console.error('Transaction aborted/failed:', eventMessage)
        setError('Payment was cancelled or failed. Please try again.')
        setIsLoading(false)
        return
      }

      if (eventStatus === 'HIDE') {
        console.warn('👋 Modal closed')
        setIsLoading(false)
        return
      }

      if (eventStatus === 'SUCCESS') {
        console.warn('🎉 Payment SUCCESS detected!')
        console.warn('🔍 Raw eventMessage:', eventMessage)

        // In-flight guard to prevent double validation
        if (isValidating) {
          console.warn('⚠️ Validation already in progress, ignoring duplicate SUCCESS event')
          return
        }

        // Normalize eventMessage → { hash, data }
        let normalized: { hash: string; data: Record<string, unknown> }
        try {
          const parsed = typeof eventMessage === 'string' ? JSON.parse(eventMessage) : eventMessage

          // Wrapper shape: { data: { hash, data }, status, headers… }
          if (
            parsed &&
            typeof parsed === 'object' &&
            (parsed as Record<string, unknown>).data &&
            ((parsed as Record<string, unknown>).data as Record<string, unknown>).hash &&
            ((parsed as Record<string, unknown>).data as Record<string, unknown>).data
          ) {
            normalized = {
              hash: ((parsed as Record<string, unknown>).data as Record<string, unknown>).hash as string,
              data: ((parsed as Record<string, unknown>).data as Record<string, unknown>).data as Record<string, unknown>
            }
            console.warn('📦 Unwrapped HTTP wrapper to normalized message:', normalized)
          } else if (
            parsed &&
            typeof parsed === 'object' &&
            (parsed as Record<string, unknown>).hash &&
            (parsed as Record<string, unknown>).data
          ) {
            normalized = parsed as { hash: string; data: Record<string, unknown> }
            console.warn('📦 Already normalized message:', normalized)
          } else {
            throw new Error('Invalid eventMessage shape - missing hash or data')
          }
        } catch (err) {
          console.error('❌ Failed to parse/normalize eventMessage:', err)
          setError('Invalid payment response format')
          setIsLoading(false)
          return
        }

        if (!normalized.hash || !normalized.data) {
          console.error('❌ Invalid normalized message structure:', normalized)
          setError('Invalid payment response format')
          setIsLoading(false)
          return
        }

        console.warn('✅ Normalized message validated:', {
          hasData: !!normalized.data,
          hasHash: !!normalized.hash,
          dataKeys: Object.keys(normalized.data),
          hashLength: normalized.hash.length
        })

        // Set validating flag and validate server-side (secretToken lookup)
        setIsValidating(true)
        console.warn('🔐 Starting validation...')
        validateResponse(normalized, currentCheckoutToken)
          .then(async (res) => {
            console.warn('📡 Validation HTTP status:', res.status)
            const json = await res.json().catch(() => ({}))
            console.warn('✅ Validation result payload:', json)

            if (res.ok && json?.success) {
              console.warn('💾 Updating system values…')
              await updateSystemValues(normalized)
              console.warn('🚀 Redirecting to success page…')
              window.location.href = `/invoice/${invoice.token}?payment=success`
              return
            }

            // Validation explicitly failed
            console.error('❌ Server validation failed:', json)
            setError('Payment validation failed. Please contact support.')
            window.location.href = `/invoice/${invoice.token}?payment=review`
          })
          .catch((err) => {
            // Network/runtime issues (was your earlier "Failed to fetch")
            console.error('❌ Payment validation network error:', err)
            setError('Could not verify payment. Please refresh or contact support.')
            window.location.href = `/invoice/${invoice.token}?payment=review`
          })
          .finally(() => {
            setIsValidating(false)
          })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [currentCheckoutToken, invoice.token])

  function validateResponse(normalizedMessage: { data: Record<string, unknown>; hash: string }, checkoutToken: string) {
    console.warn('🔐 Validating response with payload:', {
      hasData: !!normalizedMessage.data,
      hasHash: !!normalizedMessage.hash,
      checkoutToken: checkoutToken?.substring(0, 8) + '...',
      dataKeys: Object.keys(normalizedMessage.data),
      hashLength: normalizedMessage.hash.length
    })

    const payload = {
      rawDataResponse: normalizedMessage.data,
      checkoutToken,
      hash: normalizedMessage.hash
    }

    console.warn('📤 Sending validation payload:', {
      hasRawData: !!payload.rawDataResponse,
      hasCheckoutToken: !!payload.checkoutToken,
      hasHash: !!payload.hash
    })

    return fetch('/api/helcim/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  async function updateSystemValues(normalizedMessage: { data: Record<string, unknown>; hash: string }) {
    const tx = normalizedMessage.data as Record<string, unknown> & { invoiceNumber?: string; transactionId?: string }
    if (tx.invoiceNumber && tx.transactionId) {
      try {
        const res = await fetch('/api/invoice/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: tx.invoiceNumber,
            status: 'paid',
            transactionId: tx.transactionId
          })
        })
        if (!res.ok) console.error('❌ Failed to update invoice status:', await res.text())
        else console.warn('✅ Invoice status updated')
      } catch (e) {
        console.error('❌ Error updating invoice status:', e)
      }
    } else {
      console.warn('⚠️ Missing invoice data for system update:', {
        invoiceNumber: tx.invoiceNumber,
        transactionId: tx.transactionId,
        availableKeys: Object.keys(normalizedMessage.data || {})
      })
    }
  }

  const handlePayNow = async () => {
    if (!isInitialized) {
      setError('HelcimPay is still loading, please wait...')
      return
    }
    if (!window.appendHelcimPayIframe) {
      setError('HelcimPay is not available. Please refresh the page and try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const customerInfo = {
        name: invoice.billingAddress.name || '',
        businessName: '',
        email: invoice.billingAddress.email || '',
        phone: invoice.billingAddress.phone || '',
        street1: invoice.billingAddress.street1 || '',
        street2: invoice.billingAddress.street2 || '',
        city: invoice.billingAddress.city || '',
        province: invoice.billingAddress.province || '',
        country: invoice.billingAddress.country || 'CA',
        postalCode: invoice.billingAddress.postalCode || ''
      }

      // Initialize (server stores secretToken keyed by checkoutToken)
      const response = await fetch('/api/helcim/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: { ...invoice, hasConvenienceFee: invoice.hasConvenienceFee },
          customerInfo,
          confirmationScreen: false
        })
      })

      const data = await response.json()
      if (!response.ok || !data?.checkoutToken) {
        console.error('Payment initialization failed:', data)
        throw new Error(data?.error || 'Failed to initialize payment')
      }

      setCurrentCheckoutToken(data.checkoutToken)

      try {
        window.appendHelcimPayIframe(data.checkoutToken)
      } catch (iframeError) {
        console.error('HelcimPay iframe error:', iframeError)
        throw new Error('Unable to open payment modal. Please try again.')
      }
    } catch (err: unknown) {
      console.error('Payment initialization error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
          {error && <div className="text-red-300 text-xs mt-1">{error}</div>}
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

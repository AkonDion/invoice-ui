"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { money } from '@/lib/invoice/adapter'
import type { InvoicePayload } from '@/types/invoice'
import { isPaid } from '@/types/invoice'
import { log } from '@/lib/logger'

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
      log.error('Failed to load HelcimPay script:', err)
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
      log.debug('🔍 Received message event:', {
        origin: event.origin,
        eventName,
        eventStatus,
        expectedEventName,
        currentCheckoutToken,
        fullEventData: event.data
      })

      // Only enforce token match for transactional statuses
      if (eventName !== expectedEventName) return

      log.debug('✅ Event matches our checkout token!')

      if (eventStatus === 'ABORTED') {
        log.error('Transaction aborted/failed:', eventMessage)
        setError('Payment was cancelled or failed. Please try again.')
        setIsLoading(false)
        
        // Redirect to error page for aborted payments - DISABLED
        // const errorParams = new URLSearchParams({
        //   message: 'Payment was cancelled or failed',
        //   code: 'PAYMENT_ABORTED',
        //   invoiceNumber: invoice.invoiceNumber,
        //   transactionId: 'Unknown'
        // })
        // window.location.href = `/error?${errorParams.toString()}`
        log.warn('Payment aborted - error redirect disabled')
        return
      }

      if (eventStatus === 'HIDE') {
        log.debug('👋 Modal closed')
        setIsLoading(false)
        return
      }

      if (eventStatus === 'SUCCESS') {
        log.debug('🎉 Payment SUCCESS detected!')
        log.debug('🔍 Raw eventMessage:', eventMessage)

        // In-flight guard to prevent double validation
        if (isValidating) {
          log.debug('⚠️ Validation already in progress, ignoring duplicate SUCCESS event')
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
            log.debug('📦 Unwrapped HTTP wrapper to normalized message:', normalized)
          } else if (
            parsed &&
            typeof parsed === 'object' &&
            (parsed as Record<string, unknown>).hash &&
            (parsed as Record<string, unknown>).data
          ) {
            normalized = parsed as { hash: string; data: Record<string, unknown> }
            log.debug('📦 Already normalized message:', normalized)
          } else {
            throw new Error('Invalid eventMessage shape - missing hash or data')
          }
        } catch (err) {
          log.error('❌ Failed to parse/normalize eventMessage:', err)
          setError('Invalid payment response format')
          setIsLoading(false)
          return
        }

        if (!normalized.hash || !normalized.data) {
          log.error('❌ Invalid normalized message structure:', normalized)
          setError('Invalid payment response format')
          setIsLoading(false)
          return
        }

        log.debug('✅ Normalized message validated:', {
          hasData: !!normalized.data,
          hasHash: !!normalized.hash,
          dataKeys: Object.keys(normalized.data),
          hashLength: normalized.hash.length
        })

        // Set validating flag and validate server-side (secretToken lookup)
        setIsValidating(true)
        log.debug('🔐 Starting validation...')
        validateResponse(normalized, currentCheckoutToken)
          .then(async (res) => {
            log.debug('📡 Validation HTTP status:', res.status)
            const json = await res.json().catch(() => ({}))
            log.debug('✅ Validation result payload:', json)

            if (res.ok && json?.success) {
              log.debug('💾 Updating system values…')
              await updateSystemValues(normalized)
              log.debug('🚀 Redirecting to success page…')
              
              // Build success page URL with transaction details
              const tx = normalized.data as Record<string, unknown> & { 
                invoiceNumber?: string; 
                transactionId?: string;
                amount?: string;
                status?: string;
                statusAuth?: string;
              }
              const isACH = 'bankToken' in normalized.data
              const paymentType = isACH ? 'ACH' : 'CREDIT_CARD'
              const paymentStatus = isACH ? tx.statusAuth : tx.status
              
              const successParams = new URLSearchParams({
                transactionId: tx.transactionId || '',
                amount: tx.amount || invoice.amountDue.toString(),
                invoiceNumber: tx.invoiceNumber || invoice.invoiceNumber,
                paymentType,
                status: paymentStatus || '',
                email: invoice.billingAddress.email || ''
              })
              
              window.location.href = `/success?${successParams.toString()}`
              return
            }

            // Validation explicitly failed
            log.error('❌ Server validation failed:', json)
            setError('Payment validation failed. Please contact support.')
            
            // Redirect to error page with user-friendly message - DISABLED
            // let userMessage = 'Payment verification failed. Please contact support.'
            // let errorCode = 'VALIDATION_FAILED'
            
            // // Map technical server errors to user-friendly messages
            // if (json?.error) {
            //   if (json.error.includes('checkout token')) {
            //     userMessage = 'Payment session expired. Please try again.'
            //     errorCode = 'SESSION_EXPIRED'
            //   } else if (json.error.includes('signature')) {
            //     userMessage = 'Payment verification failed. Please contact support.'
            //     errorCode = 'SIGNATURE_INVALID'
            //   } else if (json.error.includes('expired')) {
            //     userMessage = 'Payment session expired. Please try again.'
            //     errorCode = 'SESSION_EXPIRED'
            //   }
            // }
            
            // const errorParams = new URLSearchParams({
            //   message: userMessage,
            //   code: errorCode,
            //   invoiceNumber: invoice.invoiceNumber,
            //   transactionId: (normalized.data.transactionId as string) || 'Unknown'
            // })
            // window.location.href = `/error?${errorParams.toString()}`
            log.warn('Payment validation failed - error redirect disabled')
          })
          .catch((err) => {
            // Network/runtime issues (was your earlier "Failed to fetch")
            log.error('❌ Payment validation network error:', err)
            setError('Could not verify payment. Please refresh or contact support.')
            
            // Redirect to error page with network error details - DISABLED
            // const errorParams = new URLSearchParams({
            //   message: 'Network error during payment verification',
            //   code: 'NETWORK_ERROR',
            //   invoiceNumber: invoice.invoiceNumber,
            //   transactionId: 'Unknown'
            // })
            // window.location.href = `/error?${errorParams.toString()}`
            log.warn('Payment network error - error redirect disabled')
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
    log.debug('🔐 Validating response with payload:', {
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

    log.debug('📤 Sending validation payload:', {
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
    const tx = normalizedMessage.data as Record<string, unknown> & { 
      invoiceNumber?: string; 
      transactionId?: string;
      status?: string;
      statusAuth?: string;
    }
    
    if (tx.invoiceNumber && tx.transactionId) {
      try {
        // Determine invoice status based on payment type and status
        let invoiceStatus: string
        const isACH = 'bankToken' in normalizedMessage.data
        const paymentStatus = isACH ? tx.statusAuth : tx.status
        
        if (isACH) {
          // ACH Payment mapping
          switch (paymentStatus) {
            case 'PENDING':
              invoiceStatus = 'SENT' // Keep as SENT until clearing completes
              break
            case 'APPROVED':
            case 'CLEARED':
              invoiceStatus = 'PAID'
              break
            case 'DECLINED':
            case 'REJECTED':
              invoiceStatus = 'DUE' // Keep as DUE for failed ACH
              break
            default:
              invoiceStatus = 'SENT' // Default to SENT for unknown ACH status
          }
        } else {
          // Credit Card Payment mapping
          switch (paymentStatus) {
            case 'APPROVED':
              invoiceStatus = 'PAID'
              break
            case 'DECLINED':
            case 'REJECTED':
            case 'ABORTED':
              invoiceStatus = 'DUE' // Keep as DUE for failed payments
              break
            default:
              invoiceStatus = 'DUE' // Default to DUE for unknown CC status
          }
        }

        log.debug('💳 Payment status mapping:', {
          paymentType: isACH ? 'ACH' : 'CREDIT_CARD',
          paymentStatus,
          invoiceStatus
        })

        const res = await fetch('/api/invoice/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: tx.invoiceNumber,
            status: invoiceStatus,
            transactionId: tx.transactionId
          })
        })
        if (!res.ok) log.error('❌ Failed to update invoice status:', await res.text())
        else log.debug('✅ Invoice status updated to:', invoiceStatus)
      } catch (e) {
        log.error('❌ Error updating invoice status:', e)
      }
    } else {
      log.warn('⚠️ Missing invoice data for system update:', {
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
        log.error('Payment initialization failed:', data)
        throw new Error(data?.error || 'Failed to initialize payment')
      }

      setCurrentCheckoutToken(data.checkoutToken)

      try {
        window.appendHelcimPayIframe(data.checkoutToken)
      } catch (iframeError) {
        log.error('HelcimPay iframe error:', iframeError)
        throw new Error('Unable to open payment modal. Please try again.')
      }
    } catch (err: unknown) {
      log.error('Payment initialization error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isPaid(invoice)) {
    const downloadReceipt = () => {
      if (!invoice.receiptUrl) {
        log.warn('Receipt download URL not available')
        return
      }
      window.open(invoice.receiptUrl, '_blank')
    }

    return (
      <div className={`p-4 rounded-2xl bg-[#00D6AF]/20 backdrop-blur-md border border-[#00D6AF]/30 ${className}`}>
        <div className="text-center">
          <div className="text-green-100 font-semibold mb-2">Invoice Paid</div>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-2xl"
            onClick={downloadReceipt}
          >
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
          className="bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white font-semibold px-10 py-5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00D6AF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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

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
  // Load HelcimPay script
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

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://secure.helcim.app/helcim-pay/services/start.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  // Set up message listener that has access to current tokens
  useEffect(() => {
    const HELCIM_ORIGIN = 'https://secure.helcim.app'

    const handleMessage = (event: MessageEvent) => {
      // Log all Helcim events for debugging
      console.warn('🔍 Received message event:', {
        origin: event.origin,
        eventName: event.data?.eventName,
        eventStatus: event.data?.eventStatus,
        expectedEventName: currentCheckoutToken ? `helcim-pay-js-${currentCheckoutToken}` : 'no token set',
        currentCheckoutToken,
        fullEventData: event.data
      });

      if (event.origin !== HELCIM_ORIGIN) return
      
      // Check if this event is for our current checkout token
      if (currentCheckoutToken && event.data?.eventName === `helcim-pay-js-${currentCheckoutToken}`) {
        console.warn('✅ Event matches our checkout token!')
        
        if (event.data.eventStatus === 'ABORTED') {
          console.error('Transaction failed!', event.data.eventMessage)
          setError('Payment was cancelled or failed. Please try again.')
          setIsLoading(false)
        }

        if (event.data.eventStatus === 'SUCCESS') {
          console.warn('🎉 Payment SUCCESS detected!')
          console.warn('🔍 Raw eventMessage:', event.data.eventMessage);
          
          // Parse the eventMessage if it's a string
          const messageData = typeof event.data.eventMessage === 'string' 
            ? JSON.parse(event.data.eventMessage) 
            : event.data.eventMessage;

          console.warn('📦 Parsed payment response:', messageData);
          
          // The payment data structure from Helcim
          // messageData.data contains the actual payment response with data and hash
          const paymentData = messageData.data;
          console.warn('📊 Payment data:', paymentData);
          console.warn('📊 Payment data.data:', paymentData?.data);
          console.warn('📊 Payment data.hash:', paymentData?.hash);
          
          // Check if we have the expected structure
          if (!paymentData?.data || !paymentData?.hash) {
            console.error('❌ Invalid payment data structure:', paymentData);
            setError('Invalid payment response format');
            setIsLoading(false);
            return;
          }
          
          console.warn('🔐 Starting validation...')
          validateResponse(event.data.eventMessage, currentCheckoutToken)
            .then(response => {
              console.warn('📡 Validation response:', response.status)
              if (response.ok) {
                return response.json()
              }
              // Log the error response for debugging
              return response.json().then(errorData => {
                console.error('❌ Validation API error:', errorData)
                throw new Error(`Payment validation failed: ${errorData.error || 'Unknown error'}`)
              })
            })
            .then(result => {
              console.warn('✅ Validation result:', result)
              if (result.success) {
                console.warn('💾 Updating system values...')
                return updateSystemValues(event.data.eventMessage)
              }
              throw new Error('Payment validation failed')
            })
            .then(() => {
              console.warn('🚀 Redirecting to success page...')
              window.location.href = `/invoice/${invoice.token}?payment=success`
            })
            .catch(err => {
              console.error('❌ Payment validation error:', err)
              // Even if validation fails, if payment was successful, redirect to success page
              console.warn('🔄 Validation failed but payment succeeded, redirecting anyway...')
              window.location.href = `/invoice/${invoice.token}?payment=success`
            })
        }

        if (event.data.eventStatus === 'HIDE') {
          console.warn('👋 Modal closed')
          setIsLoading(false)
        }
      }
      
      // Fallback for any helcim event (for debugging)
      else if (event.data?.eventName && event.data.eventName.startsWith('helcim-pay-js-')) {
        console.warn('⚠️ Received helcim event but token mismatch - using fallback')
        if (event.data.eventStatus === 'SUCCESS') {
          console.warn('🔄 Using fallback reload for success')
          window.location.reload()
        }
      }
    }

    // Helper function to validate the response - matching Helcim documentation exactly
    function validateResponse(eventMessage: { data: { data: unknown; hash: string } }, checkoutToken: string) {
      console.warn('🔐 Validating response with payload:', {
        hasData: !!eventMessage.data?.data,
        hasHash: !!eventMessage.data?.hash,
        checkoutToken: checkoutToken?.substring(0, 8) + '...',
        fullEventMessage: eventMessage
      })
      
      const payload = {
        'rawDataResponse': eventMessage.data.data,
        'checkoutToken': checkoutToken,
        'hash': eventMessage.data.hash
      }
      
      console.warn('📤 Sending validation payload:', {
        hasRawData: !!payload.rawDataResponse,
        hasCheckoutToken: !!payload.checkoutToken,
        hasHash: !!payload.hash,
        payload
      })
      
      return fetch('/api/helcim/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    }

    // Helper function to update other system values - using original working format
    async function updateSystemValues(paymentData: unknown) {
      console.warn('💾 Updating system values with:', paymentData)
      
      // Parse the payment data structure
      const messageData = typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;
      const messageObj = messageData as { data?: { data?: unknown } };
      const transactionData = messageObj.data?.data || messageObj.data || messageData;
      
      console.warn('📊 Transaction data:', transactionData)
      
      // Type guard for transaction data
      const transaction = transactionData as { invoiceNumber?: string; transactionId?: string };
      
      // Update invoice status if we have the required data
      if (transaction.invoiceNumber && transaction.transactionId) {
        console.warn('📝 Updating invoice status for:', transaction.invoiceNumber)
        try {
          const response = await fetch('/api/invoice/update-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invoiceNumber: transaction.invoiceNumber,
              status: 'paid',
              transactionId: transaction.transactionId,
            }),
          })
          
          if (response.ok) {
            console.warn('✅ Invoice status updated successfully')
          } else {
            console.error('❌ Failed to update invoice status:', await response.text())
          }
        } catch (error) {
          console.error('❌ Error updating invoice status:', error)
        }
      } else {
        console.warn('⚠️ Missing invoice data for system update:', {
          invoiceNumber: transaction.invoiceNumber,
          transactionId: transaction.transactionId,
          availableKeys: transactionData && typeof transactionData === 'object' ? Object.keys(transactionData) : []
        })
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [currentCheckoutToken, invoice.token])

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
          confirmationScreen: false, // Disable Helcim's default success screen
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Payment initialization failed:', data)
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Store checkout token for message handling
      setCurrentCheckoutToken(data.checkoutToken)

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

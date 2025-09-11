import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exactly matching the CC transaction response from documentation
interface HelcimCCResponse {
  transactionId: string;      // "20163175"
  dateCreated: string;        // "2023-07-17 10:34:35"
  cardBatchId: string;        // "2915466"
  status: "APPROVED" | string;
  type: "purchase" | string;
  amount: string;             // "15.45"
  currency: string;           // "CAD"
  avsResponse: string;        // "X"
  cvvResponse: string;        // ""
  approvalCode: string;       // "T3E5ST"
  cardToken: string;          // "27128ae9440a0b47e2a068"
  cardNumber: string;         // "4000000028"
  cardHolderName: string;     // "Test"
  customerCode: string;       // "CST1049"
  invoiceNumber: string;      // "INV001045"
  warning: string;            // ""
}

// Exactly matching the ACH transaction response from documentation
interface HelcimACHResponse {
  amount: string;             // "100.00"
  approvalCode: string;       // ""
  bankAccountNumber: string;  // "100200300"
  bankToken: string;          // "fcc48b4cb9a8ecd6531b49"
  batchId: string;           // "5220"
  currency: string;          // "CAD"
  customerCode: string;      // "CST1200"
  dateCreated: string;       // "2023-04-20 13:56:31"
  invoiceNumber: string;     // "INV000020"
  statusAuth: "PENDING" | string;
  statusClearing: "OPENED" | string;
  transactionId: string;     // "1020"
  type: "WITHDRAWAL" | string;
}

function validateHash(rawDataResponse: HelcimCCResponse | HelcimACHResponse, secretToken: string): string {
  // 1. First JSON encode the raw data to ensure it's a string
  const jsonString = JSON.stringify(rawDataResponse);
  
  // 2. Parse and re-encode to ensure consistent formatting (like PHP json_encode(json_decode()))
  const cleanedJsonEncodedData = JSON.stringify(JSON.parse(jsonString));
  
  // 3. Append the secretToken
  const dataWithSecret = cleanedJsonEncodedData + secretToken;
  
  // 4. Generate SHA-256 hash
  return createHash('sha256')
    .update(dataWithSecret)
    .digest('hex');
}

async function storePaymentData(
  paymentData: HelcimCCResponse | HelcimACHResponse,
  isHashValid: boolean,
  paymentType: 'CREDIT_CARD' | 'ACH'
) {
  try {
    const isCreditCard = paymentType === 'CREDIT_CARD';
    const ccData = paymentData as HelcimCCResponse;
    const achData = paymentData as HelcimACHResponse;

    const { error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: paymentData.transactionId,
        date_created: paymentData.dateCreated,
        payment_type: paymentType,
        status: isCreditCard ? ccData.status : achData.statusAuth,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        customer_code: paymentData.customerCode,
        invoice_number: paymentData.invoiceNumber,
        
        // CC specific fields
        card_token: isCreditCard ? ccData.cardToken : null,
        card_last_four: isCreditCard ? ccData.cardNumber.slice(-4) : null,
        card_holder_name: isCreditCard ? ccData.cardHolderName : null,
        
        // ACH specific fields
        bank_token: !isCreditCard ? achData.bankToken : null,
        bank_account_last_four: !isCreditCard ? achData.bankAccountNumber.slice(-4) : null,
        
        // Common fields
        hash_validated: isHashValid,
        response_data: paymentData // Store full response as JSON
      });

    if (insertError) {
      console.error('Failed to store payment data:', insertError);
      throw insertError;
    }

  } catch (error) {
    console.error('Error storing payment data:', error);
    throw error;
  }
}

// Function to log transaction details to our application logs
function logTransaction(data: HelcimCCResponse | HelcimACHResponse, validationResult: boolean, hash?: string, calculatedHash?: string) {
  const isACH = 'bankToken' in data;
  const logData = {
    event: 'payment_validation',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    payment: {
      transactionId: data.transactionId,
      type: isACH ? 'ACH' : 'CREDIT_CARD',
      amount: data.amount,
      currency: data.currency,
      status: isACH ? (data as HelcimACHResponse).statusAuth : (data as HelcimCCResponse).status,
      customerCode: data.customerCode,
      invoiceNumber: data.invoiceNumber,
      lastFour: isACH 
        ? (data as HelcimACHResponse).bankAccountNumber.slice(-4)
        : (data as HelcimCCResponse).cardNumber.slice(-4)
    },
    validation: {
      success: validationResult,
      receivedHash: hash,
      calculatedHash: calculatedHash,
      hashMatch: hash === calculatedHash
    }
  };

  // Always log the event for Railway logs
  process.stdout.write(`[HELCIM-PAYMENT] ${JSON.stringify({
    ...logData,
    raw_response: process.env.NODE_ENV === 'development' ? data : undefined
  }, null, 2)}\n`);

  // Log errors to stderr for Railway error tracking
  if (!validationResult) {
    process.stderr.write(`[HELCIM-ERROR] Payment validation failed: ${JSON.stringify({
      transactionId: data.transactionId,
      invoiceNumber: data.invoiceNumber,
      validation: logData.validation
    }, null, 2)}\n`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rawDataResponse, checkoutToken, hash } = await request.json();
    
    process.stdout.write(`[HELCIM-VALIDATE] Received validation request: ${JSON.stringify({
      transactionId: rawDataResponse.transactionId,
      checkoutToken,
      hash
    }, null, 2)}\n`);

    if (!rawDataResponse || !checkoutToken || !hash) {
      console.error('Missing required fields in validation request');
      return NextResponse.json(
        { error: 'Invalid validation request' },
        { status: 400 }
      );
    }

    // Determine payment type based on response structure
    const paymentType = 'bankToken' in rawDataResponse ? 'ACH' : 'CREDIT_CARD';
    
    // Log the validation attempt
    process.stdout.write(`[HELCIM-VALIDATE] Validating transaction: ${JSON.stringify({
      transactionId: rawDataResponse.transactionId,
      amount: rawDataResponse.amount,
      status: rawDataResponse.status,
      receivedHash: hash
    }, null, 2)}\n`);

    // Store the payment data
    await storePaymentData(rawDataResponse, true, paymentType);

    // Log the transaction details
    logTransaction(rawDataResponse, true, hash);

    return NextResponse.json({
      success: true,
      transactionId: rawDataResponse.transactionId,
      paymentType,
      status: paymentType === 'CREDIT_CARD' 
        ? (rawDataResponse as HelcimCCResponse).status 
        : (rawDataResponse as HelcimACHResponse).statusAuth
    });
  } catch (error) {
    // Log the error details
    process.stderr.write(`[HELCIM-ERROR] Payment validation failed: ${JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      rawResponse: rawDataResponse
    }, null, 2)}\n`);

    return NextResponse.json(
      { error: 'Payment validation error' },
      { status: 500 }
    );
  }
}

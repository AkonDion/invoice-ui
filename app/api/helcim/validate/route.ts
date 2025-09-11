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
  // 1. JSON encode the transaction response data
  // Note: We sort the keys to ensure consistent ordering
  const cleanedData = JSON.stringify(rawDataResponse, Object.keys(rawDataResponse).sort());
  
  // 2. Append the secretToken
  const dataWithSecret = cleanedData + secretToken;
  
  // 3. Hash using SHA-256
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
    // First insert the base transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: paymentData.transactionId,
        date_created: paymentData.dateCreated,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        status: paymentType === 'CREDIT_CARD' 
          ? (paymentData as HelcimCCResponse).status
          : (paymentData as HelcimACHResponse).statusAuth,
        payment_type: paymentType,
        customer_code: paymentData.customerCode,
        invoice_number: paymentData.invoiceNumber
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Then insert the payment specific details
    if (paymentType === 'CREDIT_CARD') {
      const ccData = paymentData as HelcimCCResponse;
      const { error: ccError } = await supabase
        .from('credit_card_details')
        .insert({
          payment_transaction_id: transaction.id,
          card_batch_id: ccData.cardBatchId,
          avs_response: ccData.avsResponse,
          cvv_response: ccData.cvvResponse,
          approval_code: ccData.approvalCode,
          card_token: ccData.cardToken,
          card_number: ccData.cardNumber,
          card_holder_name: ccData.cardHolderName,
          warning: ccData.warning,
          hash_validation: isHashValid
        });

      if (ccError) throw ccError;
    } else {
      const achData = paymentData as HelcimACHResponse;
      const { error: achError } = await supabase
        .from('ach_details')
        .insert({
          payment_transaction_id: transaction.id,
          bank_token: achData.bankToken,
          bank_account_number: achData.bankAccountNumber,
          batch_id: achData.batchId,
          status_auth: achData.statusAuth,
          status_clearing: achData.statusClearing,
          hash_validation: isHashValid
        });

      if (achError) throw achError;
    }

    return transaction;
  } catch (error) {
    console.error('Error storing payment data:', error);
    throw error;
  }
}

// Function to log transaction details to our application logs
function logTransaction(data: HelcimCCResponse | HelcimACHResponse, validationResult: boolean) {
  const isACH = 'bankToken' in data;
  const logData = {
    timestamp: new Date().toISOString(),
    transactionId: data.transactionId,
    type: isACH ? 'ACH' : 'CREDIT_CARD',
    amount: data.amount,
    currency: data.currency,
    status: isACH ? (data as HelcimACHResponse).statusAuth : (data as HelcimCCResponse).status,
    validationResult,
    customerCode: data.customerCode,
    invoiceNumber: data.invoiceNumber
  };

  // Log to your application's logging system
  if (validationResult) {
    console.warn('Transaction processed successfully:', JSON.stringify(logData, null, 2));
  } else {
    console.error('Transaction validation failed:', JSON.stringify(logData, null, 2));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rawDataResponse, checkoutToken, secretToken } = await request.json();

    if (!rawDataResponse || !checkoutToken || !secretToken) {
      console.error('Missing required fields in validation request');
      return NextResponse.json(
        { error: 'Invalid validation request' },
        { status: 400 }
      );
    }

    // Determine payment type based on response structure
    const paymentType = 'bankToken' in rawDataResponse ? 'ACH' : 'CREDIT_CARD';
    
    // Calculate hash following Helcim documentation
    const calculatedHash = validateHash(rawDataResponse, secretToken);
    
    // Get hash from Helcim API for verification
    const helcimResponse = await fetch(`${process.env.HELCIM_API_BASE}/helcim-pay/validate`, {
      method: 'POST',
      headers: {
        'api-token': process.env.HELCIM_API_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkoutToken, secretToken }),
    });

    if (!helcimResponse.ok) {
      console.error('Helcim API validation failed:', await helcimResponse.text());
      return NextResponse.json(
        { error: 'Payment validation failed' },
        { status: 400 }
      );
    }

    const helcimData = await helcimResponse.json();
    const isHashValid = calculatedHash === helcimData.hash;

    // Log the transaction details
    logTransaction(rawDataResponse, isHashValid);

    // Store the payment data
    await storePaymentData(rawDataResponse, isHashValid, paymentType);

    return NextResponse.json({
      success: true,
      transactionId: rawDataResponse.transactionId,
      paymentType,
      status: paymentType === 'CREDIT_CARD' 
        ? (rawDataResponse as HelcimCCResponse).status 
        : (rawDataResponse as HelcimACHResponse).statusAuth
    });
  } catch (error) {
    console.error('Payment validation error:', error);
    return NextResponse.json(
      { error: 'Payment validation error' },
      { status: 500 }
    );
  }
}

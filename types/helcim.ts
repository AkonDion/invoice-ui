interface HelcimPaymentData {
  amount: string
  currency: string
  invoiceNumber: string
  transactionId: string
  bankToken?: string
  cardToken?: string
  status?: string
}

interface HelcimMessageData {
  data: {
    data: HelcimPaymentData
    hash: string
  }
}

export type { HelcimPaymentData, HelcimMessageData }

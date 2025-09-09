import { z } from "zod"

export type InvoiceAddress = {
  name: string
  street1: string
  street2: string
  city: string
  province: string
  country: string
  postalCode: string
  phone: string
  email: string
}

export type InvoiceLineItem = {
  sku: string
  description: string
  quantity: number
  price: number // unit price
  total: number // extended
  taxAmount: number
  discountAmount: number
}

export type InvoiceTax = { 
  details: string
  amount: number 
}

export type InvoiceDiscounts = { 
  details: string
  amount: number 
}

export type InvoiceShipping = { 
  amount: number
  details: string
  address: InvoiceAddress 
}

export type InvoicePickup = {
  name: string
  date: string
}

export type InvoicePayload = {
  invoiceId: number
  invoiceNumber: string
  token: string
  tipAmount: number
  depositAmount: number
  notes: string
  dateCreated: string
  dateUpdated: string
  datePaid: string // "0000-00-00 00:00:00" if unpaid
  dateIssued: string
  status: "DUE" | "PAID" | "PARTIAL" | "VOID" | "REFUNDED" | "DRAFT" | "SENT"
  customerId: number
  customerCode: string
  amount: number // total
  amountPaid: number
  amountDue: number
  currency: "CAD" | "USD"
  type: "INVOICE"
  hasConvenienceFee: number
  orderFields: any[]
  billingAddress: InvoiceAddress
  shipping: InvoiceShipping
  lineItems: InvoiceLineItem[]
  pickup: InvoicePickup
  tax: InvoiceTax
  discounts: InvoiceDiscounts
}

export type InvoicePageProps = {
  invoice: InvoicePayload
}

// Zod schemas for validation
export const invoiceAddressSchema = z.object({
  name: z.string(),
  street1: z.string(),
  street2: z.string(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  postalCode: z.string(),
  phone: z.string(),
  email: z.string(),
})

export const invoiceLineItemSchema = z.object({
  sku: z.string(),
  description: z.string(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
  taxAmount: z.number(),
  discountAmount: z.number(),
})

export const invoiceTaxSchema = z.object({
  details: z.string(),
  amount: z.number(),
})

export const invoiceDiscountsSchema = z.object({
  details: z.string(),
  amount: z.number(),
})

export const invoiceShippingSchema = z.object({
  amount: z.number(),
  details: z.string(),
  address: invoiceAddressSchema,
})

export const invoicePickupSchema = z.object({
  name: z.string(),
  date: z.string(),
})

export const invoicePayloadSchema = z.object({
  invoiceId: z.number(),
  invoiceNumber: z.string(),
  token: z.string(),
  tipAmount: z.number(),
  depositAmount: z.number(),
  notes: z.string(),
  dateCreated: z.string(),
  dateUpdated: z.string(),
  datePaid: z.string(),
  dateIssued: z.string(),
  status: z.enum(["DUE", "PAID", "PARTIAL", "VOID", "REFUNDED", "DRAFT", "SENT"]),
  customerId: z.number(),
  customerCode: z.string(),
  amount: z.number(),
  amountPaid: z.number(),
  amountDue: z.number(),
  currency: z.enum(["CAD", "USD"]),
  type: z.literal("INVOICE"),
  hasConvenienceFee: z.number(),
  orderFields: z.array(z.any()),
  billingAddress: invoiceAddressSchema,
  shipping: invoiceShippingSchema,
  lineItems: z.array(invoiceLineItemSchema),
  pickup: invoicePickupSchema,
  tax: invoiceTaxSchema,
  discounts: invoiceDiscountsSchema,
})

export const invoicesArraySchema = z.array(invoicePayloadSchema).min(1)

// Utility function to check if invoice is paid
export function isPaid(invoice: InvoicePayload): boolean {
  return (
    invoice.status === 'PAID' ||
    (Number(invoice.amountDue) <= 0 && invoice.datePaid !== "0000-00-00 00:00:00")
  )
}

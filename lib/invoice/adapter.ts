import { z } from "zod"
import { invoicePayloadSchema, invoicesArraySchema, type InvoicePayload } from "@/types/invoice"

/**
 * Normalizes raw invoice data from the API and validates it with Zod
 */
export function normalizeInvoice(raw: unknown): InvoicePayload {
  try {
    // First try to parse as array and take first element
    const arrayResult = invoicesArraySchema.safeParse(raw)
    if (arrayResult.success) {
      return arrayResult.data[0]
    }

    // If that fails, try to parse as single invoice
    const singleResult = invoicePayloadSchema.safeParse(raw)
    if (singleResult.success) {
      return singleResult.data
    }

    // If both fail, throw with detailed error
    const error = arrayResult.error || singleResult.error
    throw new Error(`Invalid invoice data: ${error?.message}`)
  } catch (error) {
    console.error("Failed to normalize invoice:", error)
    throw new Error(`Invalid invoice data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Calculates subtotal from line items
 */
export function calcSubtotal(items: { total: number }[] | undefined | null): number {
  if (!items || !Array.isArray(items)) return 0
  return items.reduce((sum, item) => sum + (typeof item?.total === 'number' ? item.total : 0), 0)
}

/**
 * Formats money using Intl.NumberFormat
 */
export function money(amount: number, currency: "CAD" | "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

/**
 * Formats date string, handling the special "0000-00-00 00:00:00" case
 */
export function formatDate(dateString: string): string {
  if (dateString === "0000-00-00 00:00:00") return "Not paid"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Checks if an address field should be displayed (not empty string)
 */
export function hasAddressField(value: string): boolean {
  return value.trim() !== ""
}

/**
 * Gets display value for address field, returning undefined if empty
 */
export function getAddressField(value: string): string | undefined {
  return hasAddressField(value) ? value : undefined
}

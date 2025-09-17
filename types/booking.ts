import { z } from "zod"

export type Service = {
  id: string // UUID in your database
  name: string
  description: string
  price: number
  tax: number // Tax amount from database
  duration: number // in minutes (we'll set a default)
  fsm_id: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string // contactid in your database
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  country: string
  created_at: string
  updated_at: string
}

export type BookingSession = {
  id: number
  token: string
  contact_id: string // contactid from customers table
  fsm_id: string[] // Array of FSM IDs
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED"
  selected_services: string[] // Array of service UUIDs
  scheduled_date?: string
  notes?: string
  created_at: string
  expires_at: string
}

export type BookingPayload = {
  token: string
  contact: Contact
  services: Service[]
  fsmId: string[] // Array of FSM IDs
  status: string
  selectedServices: Service[]
  totalAmount: number
  totalDuration: number
  scheduledDate?: string
  notes?: string
  expiresAt: string
}

// Zod schemas for validation
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tax: z.number(),
  duration: z.number(),
  fsm_id: z.string(),
  category: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  postal_code: z.string(),
  country: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const bookingSessionSchema = z.object({
  id: z.number(),
  token: z.string(),
  contact_id: z.string(),
  fsm_id: z.array(z.string()), // Array of FSM IDs
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"]),
  selected_services: z.array(z.string()),
  scheduled_date: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  expires_at: z.string(),
})

export const bookingPayloadSchema = z.object({
  token: z.string(),
  contact: contactSchema,
  services: z.array(serviceSchema),
  fsmId: z.array(z.string()), // Array of FSM IDs
  status: z.string(),
  selectedServices: z.array(serviceSchema),
  totalAmount: z.number(),
  totalDuration: z.number(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string(),
})

// Utility functions
export function calculateTotalAmount(services: Service[]): number {
  return services.reduce((total, service) => total + service.price, 0)
}

export function calculateTotalDuration(services: Service[]): number {
  return services.reduce((total, service) => total + service.duration, 0)
}

export function isBookingExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

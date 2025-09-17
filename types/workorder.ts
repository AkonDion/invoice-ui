import { z } from 'zod';

// Address types
export type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

export const addressSchema = z.object({
  id: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postal: z.string(),
  country: z.string(),
});

// Contact type
export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
});

// Line item types
export type ServiceLineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  amount: number;
  status: string;
  service: string;
};

export type PartLineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  amount: number;
  listPrice: number;
  partName: string;
};

export const serviceLineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  amount: z.number(),
  status: z.string(),
  service: z.string(),
});

export const partLineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  amount: z.number(),
  listPrice: z.number(),
  partName: z.string(),
});

// Appointment type
export type Appointment = {
  id: string;
  name: string;
  serviceAppointmentId: string;
  serviceAppointmentName: string;
  serviceLineItemId: string;
};

export const appointmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  serviceAppointmentId: z.string(),
  serviceAppointmentName: z.string(),
  serviceLineItemId: z.string(),
});

// Main work order type
export type WorkOrder = {
  workOrderId: string;
  workOrderName: string;
  status: string;
  type: string;
  grandTotal: number;
  subTotal: number;
  taxAmount: number;
  billingStatus: string;
  quickbooksInvoiceId: string;
  quickbooksInvoiceNumber: string;
  saleOrderId: string;
  contact: Contact;
  serviceAddress: Address;
  billingAddress: Address;
  serviceLineItems: ServiceLineItem[];
  partLineItems: PartLineItem[];
  appointments: Appointment[];
  created_at?: string;
  scheduled_date?: string;
};

export const workOrderSchema = z.object({
  workOrderId: z.string(),
  workOrderName: z.string(),
  status: z.string(),
  type: z.string(),
  grandTotal: z.number(),
  subTotal: z.number(),
  taxAmount: z.number(),
  billingStatus: z.string(),
  quickbooksInvoiceId: z.string(),
  quickbooksInvoiceNumber: z.string(),
  saleOrderId: z.string(),
  contact: contactSchema,
  serviceAddress: addressSchema,
  billingAddress: addressSchema,
  serviceLineItems: z.array(serviceLineItemSchema),
  partLineItems: z.array(partLineItemSchema),
  appointments: z.array(appointmentSchema),
  created_at: z.string().optional(),
  scheduled_date: z.string().optional(),
});

// Work order session type for database
export type WorkOrderSession = {
  id: number;
  token: string;
  work_order_id: string;
  work_order_name: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  work_order_type: string;
  grand_total: number;
  sub_total: number;
  tax_amount: number;
  billing_status: string;
  quickbooks_invoice_id: string;
  quickbooks_invoice_number: string;
  sale_order_id: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  service_address_id: string;
  service_street: string;
  service_city: string;
  service_state: string;
  service_postal: string;
  service_country: string;
  billing_address_id: string;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_postal: string;
  billing_country: string;
  scheduled_date?: string;
  notes?: string;
  created_at: string;
  expires_at: string;
};

// Work order payload for UI
export type WorkOrderPayload = {
  token: string;
  workOrder: WorkOrder;
  status: string;
  scheduledDate?: string;
  notes?: string;
  totalAmount: number;
  totalDuration: number;
  expiresAt: string;
};

export const workOrderPayloadSchema = z.object({
  token: z.string(),
  workOrder: workOrderSchema,
  status: z.string(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  totalAmount: z.number(),
  totalDuration: z.number(),
  expiresAt: z.string(),
});

// Utility functions
export function calculateWorkOrderTotal(workOrder: WorkOrder): number {
  return workOrder.grandTotal;
}

export function calculateWorkOrderDuration(workOrder: WorkOrder): number {
  // For work orders, we'll use a default duration based on the type
  // This could be enhanced to calculate based on service line items
  const typeDurations: Record<string, number> = {
    'Installation': 480, // 8 hours
    'Maintenance': 120,  // 2 hours
    'Repair': 240,       // 4 hours
    'Inspection': 60,    // 1 hour
  };
  
  return typeDurations[workOrder.type] || 240; // Default 4 hours
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}


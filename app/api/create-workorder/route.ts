import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { workOrderSchema } from '@/types/workorder';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const workOrderData = await request.json();

    // Validate the work order data
    const validatedWorkOrder = workOrderSchema.parse(workOrderData);

    // Generate a unique work order token
    // Generate a unique token using crypto.randomUUID() (built into Node.js)
    const workOrderToken = crypto.randomUUID().replace(/-/g, '');

    // Create work order session in database
    const { data: workOrderSession, error } = await supabase
      .from('workorders')
      .insert({
        token: workOrderToken,
        work_order_id: validatedWorkOrder.workOrderId,
        work_order_name: validatedWorkOrder.workOrderName,
        status: 'ACTIVE',
        work_order_type: validatedWorkOrder.type,
        grand_total: validatedWorkOrder.grandTotal,
        sub_total: validatedWorkOrder.subTotal,
        tax_amount: validatedWorkOrder.taxAmount,
        billing_status: validatedWorkOrder.billingStatus,
        quickbooks_invoice_id: validatedWorkOrder.quickbooksInvoiceId,
        quickbooks_invoice_number: validatedWorkOrder.quickbooksInvoiceNumber,
        sale_order_id: validatedWorkOrder.saleOrderId,
        contact_id: validatedWorkOrder.contact.id,
        contact_name: validatedWorkOrder.contact.name,
        contact_email: validatedWorkOrder.contact.email,
        contact_phone: validatedWorkOrder.contact.phone,
        service_address_id: validatedWorkOrder.serviceAddress.id,
        service_street: validatedWorkOrder.serviceAddress.street,
        service_city: validatedWorkOrder.serviceAddress.city,
        service_state: validatedWorkOrder.serviceAddress.state,
        service_postal: validatedWorkOrder.serviceAddress.postal,
        service_country: validatedWorkOrder.serviceAddress.country,
        billing_address_id: validatedWorkOrder.billingAddress.id,
        billing_street: validatedWorkOrder.billingAddress.street,
        billing_city: validatedWorkOrder.billingAddress.city,
        billing_state: validatedWorkOrder.billingAddress.state,
        billing_postal: validatedWorkOrder.billingAddress.postal,
        billing_country: validatedWorkOrder.billingAddress.country,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order session:', error);
      return NextResponse.json(
        { error: 'Failed to create work order session' },
        { status: 500 }
      );
    }

    // Insert service line items
    if (validatedWorkOrder.serviceLineItems.length > 0) {
      const serviceLineItems = validatedWorkOrder.serviceLineItems.map(item => ({
        workorder_id: workOrderSession.id,
        line_item_id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        amount: item.amount,
        item_type: 'service',
        status: item.status
      }));

      const { error: serviceError } = await supabase
        .from('workorder_line_items')
        .insert(serviceLineItems);

      if (serviceError) {
        console.error('Error inserting service line items:', serviceError);
      }
    }

    // Insert part line items
    if (validatedWorkOrder.partLineItems.length > 0) {
      const partLineItems = validatedWorkOrder.partLineItems.map(item => ({
        workorder_id: workOrderSession.id,
        line_item_id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        amount: item.amount,
        list_price: item.listPrice,
        part_name: item.partName,
        item_type: 'part'
      }));

      const { error: partError } = await supabase
        .from('workorder_line_items')
        .insert(partLineItems);

      if (partError) {
        console.error('Error inserting part line items:', partError);
      }
    }

    // Insert appointments
    if (validatedWorkOrder.appointments.length > 0) {
      const appointments = validatedWorkOrder.appointments.map(appointment => ({
        workorder_id: workOrderSession.id,
        appointment_id: appointment.id,
        appointment_name: appointment.name,
        service_appointment_id: appointment.serviceAppointmentId,
        service_appointment_name: appointment.serviceAppointmentName,
        service_line_item_id: appointment.serviceLineItemId
      }));

      const { error: appointmentError } = await supabase
        .from('workorder_appointments')
        .insert(appointments);

      if (appointmentError) {
        console.error('Error inserting appointments:', appointmentError);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/workorder/${workOrderToken}`;

    console.log('✅ Work order session created:', {
      token: workOrderToken,
      workOrderId: validatedWorkOrder.workOrderId,
      workOrderName: validatedWorkOrder.workOrderName,
      contactName: validatedWorkOrder.contact.name,
      contactEmail: validatedWorkOrder.contact.email,
      grandTotal: validatedWorkOrder.grandTotal,
      serviceLineItemsCount: validatedWorkOrder.serviceLineItems.length,
      partLineItemsCount: validatedWorkOrder.partLineItems.length,
      appointmentsCount: validatedWorkOrder.appointments.length
    });

    return NextResponse.json({
      url,
      token: workOrderToken,
      workOrder: {
        id: validatedWorkOrder.workOrderId,
        name: validatedWorkOrder.workOrderName,
        type: validatedWorkOrder.type,
        grandTotal: validatedWorkOrder.grandTotal,
        contact: validatedWorkOrder.contact
      },
      expires_at: workOrderSession.expires_at
    });

  } catch (error) {
    console.error('Error processing work order:', error);
    return NextResponse.json(
      { error: 'Failed to process work order' },
      { status: 500 }
    );
  }
}

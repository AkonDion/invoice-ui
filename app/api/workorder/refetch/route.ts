import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { workOrderPayloadSchema } from '@/types/workorder';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Fetch work order session
    const { data: workOrderSession, error: sessionError } = await supabase
      .from('workorders')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !workOrderSession) {
      return NextResponse.json(
        { error: 'Work order not found' },
        { status: 404 }
      );
    }

    // Check if work order has expired
    const now = new Date();
    const expiresAt = new Date(workOrderSession.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Work order has expired' },
        { status: 410 }
      );
    }

    // Fetch line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('workorder_line_items')
      .select('*')
      .eq('workorder_id', workOrderSession.id)
      .order('item_type', { ascending: true });

    if (lineItemsError) {
      console.error('Error fetching line items:', lineItemsError);
    }

    // Fetch appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('workorder_appointments')
      .select('*')
      .eq('workorder_id', workOrderSession.id);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
    }

    // Separate service and part line items
    const serviceLineItems = (lineItems || [])
      .filter(item => item.item_type === 'service')
      .map(item => ({
        id: item.line_item_id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit || '',
        amount: parseFloat(item.amount || '0'),
        status: item.status || '',
        service: item.description || ''
      }));

    const partLineItems = (lineItems || [])
      .filter(item => item.item_type === 'part')
      .map(item => ({
        id: item.line_item_id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit || '',
        amount: parseFloat(item.amount || '0'),
        listPrice: parseFloat(item.list_price || '0'),
        partName: item.part_name || ''
      }));

    // Map appointments
    const mappedAppointments = (appointments || []).map(appointment => ({
      id: appointment.appointment_id,
      name: appointment.appointment_name,
      serviceAppointmentId: appointment.service_appointment_id || '',
      serviceAppointmentName: appointment.service_appointment_name || '',
      serviceLineItemId: appointment.service_line_item_id || ''
    }));

    // Create work order object
    const workOrder = {
      workOrderId: workOrderSession.work_order_id,
      workOrderName: workOrderSession.work_order_name,
      status: workOrderSession.status,
      type: workOrderSession.work_order_type || '',
      grandTotal: parseFloat(workOrderSession.grand_total || '0'),
      subTotal: parseFloat(workOrderSession.sub_total || '0'),
      taxAmount: parseFloat(workOrderSession.tax_amount || '0'),
      billingStatus: workOrderSession.billing_status || '',
      quickbooksInvoiceId: workOrderSession.quickbooks_invoice_id || '',
      quickbooksInvoiceNumber: workOrderSession.quickbooks_invoice_number || '',
      saleOrderId: workOrderSession.sale_order_id || '',
      contact: {
        id: workOrderSession.contact_id,
        name: workOrderSession.contact_name || 'Unknown Customer',
        email: workOrderSession.contact_email || '',
        phone: workOrderSession.contact_phone || ''
      },
      serviceAddress: {
        id: workOrderSession.service_address_id || '',
        street: workOrderSession.service_street || '',
        city: workOrderSession.service_city || '',
        state: workOrderSession.service_state || '',
        postal: workOrderSession.service_postal || '',
        country: workOrderSession.service_country || ''
      },
      billingAddress: {
        id: workOrderSession.billing_address_id || '',
        street: workOrderSession.billing_street || '',
        city: workOrderSession.billing_city || '',
        state: workOrderSession.billing_state || '',
        postal: workOrderSession.billing_postal || '',
        country: workOrderSession.billing_country || ''
      },
      serviceLineItems,
      partLineItems,
      appointments: mappedAppointments,
      created_at: workOrderSession.created_at,
      scheduled_date: workOrderSession.scheduled_date ?? undefined
    };

    const workOrderPayload = {
      token: workOrderSession.token,
      workOrder,
      status: workOrderSession.status,
      scheduledDate: workOrderSession.scheduled_date || undefined,
      notes: workOrderSession.notes || undefined,
      totalAmount: workOrder.grandTotal,
      totalDuration: 480, // Default 8 hours for installation
      expiresAt: workOrderSession.expires_at
    };

    const validatedPayload = workOrderPayloadSchema.parse(workOrderPayload);

    console.log('🔧 Work Order Refetch - Fresh work order data from DB:', {
      status: workOrderSession.status,
      workOrderName: workOrderSession.work_order_name,
      contactName: workOrderSession.contact_name,
      expiresAt: workOrderSession.expires_at
    });

    return NextResponse.json({ workOrder: validatedPayload, success: true });

  } catch (error) {
    console.error('Error refetching work order:', error);
    return NextResponse.json(
      { error: 'Failed to refetch work order' },
      { status: 500 }
    );
  }
}

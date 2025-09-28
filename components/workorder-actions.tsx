'use client';

import { WorkOrder } from '@/types/workorder';
import { Calendar, Clock, CheckCircle, AlertCircle, Clock3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/types/workorder';
import { CalendarAvailability } from './calendar-availability';
import { CalendarSlot } from '@/types/calendar';

interface WorkOrderActionsProps {
  workOrder: WorkOrder;
  totalAmount: number;
  totalDuration: number;
  workOrderStatus?: string | string[] | undefined;
  workOrderToken: string;
  isScheduled?: boolean;
  scheduledDate?: string;
  workOrderSessionStatus?: string;
}

export function WorkOrderActions({ 
  workOrder, 
  totalAmount, 
  totalDuration, 
  workOrderStatus,
  workOrderToken,
  isScheduled = false,
  scheduledDate,
  workOrderSessionStatus
}: WorkOrderActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isScheduledLocal, setIsScheduledLocal] = useState(false);

  // Function to format arrival window for workorders (1-hour window from start time)
  const formatArrivalWindow = (slot: CalendarSlot) => {
    const start = new Date(slot.start);
    const end = new Date(start.getTime() + (60 * 60 * 1000)); // Add 1 hour for arrival window
    
    const startFormatted = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const endFormatted = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Function to format work duration (8 hours from start time)
  const formatWorkDuration = (slot: CalendarSlot) => {
    const start = new Date(slot.start);
    const end = new Date(start.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for work duration
    
    const startFormatted = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const endFormatted = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const handleScheduleWorkOrder = async () => {
    if (!selectedSlot) {
      alert('Please select a date and time for your work order.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save notes first
      const updateResponse = await fetch('/api/workorder/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: workOrderToken,
          notes: notes
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to save work order notes');
      }

      // Then schedule the work order (this locks it)
      const scheduleResponse = await fetch('/api/workorder/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: workOrderToken,
          scheduledDate: selectedSlot.start,
          notes: notes
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error('Failed to schedule work order');
      }

      const result = await scheduleResponse.json();

      // Send webhook notification
      try {
        await fetch('https://nodechain.dev/webhook/d4f57f3f-dd70-4776-843e-a3ec4f56a003', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Standardized section
            scheduledDate: selectedSlot.start,
            arrivalWindow: formatArrivalWindow(selectedSlot),
            contactId: result.workOrder.contact_id,
            bookingType: 'work_order',
            
            // Work order-specific details
            workOrderDetails: {
              workOrderId: result.workOrder.work_order_id,
              workOrder: result.workOrder,
              start: selectedSlot.start,
              notes: notes,
              timestamp: new Date().toISOString()
            }
          }),
        });
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
        // Don't fail the entire operation if webhook fails
      }

      // Show success state
      setIsScheduledLocal(true);
    } catch (error) {
      console.error('Error scheduling work order:', error);
      alert('Failed to schedule work order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message if work order was completed or scheduled
  if (workOrderStatus === 'success' || isScheduled || isScheduledLocal) {
    const formatScheduledDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    const displayDate = scheduledDate || (selectedSlot?.start);
    const displayArrivalWindow = scheduledDate ? formatArrivalWindow({ start: scheduledDate, end: new Date(new Date(scheduledDate).getTime() + 60 * 60 * 1000).toISOString() } as CalendarSlot) : (selectedSlot ? formatArrivalWindow(selectedSlot) : '');

    // Get status-specific messages
    const getStatusMessage = () => {
      // If we just scheduled locally, show SCHEDULED status immediately
      if (isScheduledLocal) {
        return {
          title: 'Work Order Submitted!',
          description: `The appointment is created in our system, we're double checking everything. We'll send confirmation to ${workOrder.contact.email} shortly.`,
          icon: CheckCircle,
          iconColor: 'text-[#00D6AF]',
          bgColor: 'bg-[#00D6AF]/20',
          borderColor: 'border-[#00D6AF]/40',
          showScheduling: true
        };
      }
      
      const status = workOrderSessionStatus?.toString().trim().toUpperCase();
      console.log('WorkOrderActions - workOrderSessionStatus:', workOrderSessionStatus);
      console.log('WorkOrderActions - processed status:', status);
      switch (status) {
        case 'SENT':
          return {
            title: 'Work Order Sent!',
            description: `Your work order request is in our inbox. We'll send confirmation to ${workOrder.contact.email} shortly.`,
            icon: Clock3,
            iconColor: 'text-blue-400',
            bgColor: 'bg-blue-500/20',
            borderColor: 'border-blue-500/40',
            showScheduling: true
          };
        case 'PENDING':
          return {
            title: 'Work Order Under Review',
            description: `We're taking a bit more time to review your work order details. We'll send confirmation to ${workOrder.contact.email} shortly.`,
            icon: Clock3,
            iconColor: 'text-blue-400',
            bgColor: 'bg-blue-500/20',
            borderColor: 'border-blue-500/40',
            showScheduling: true
          };
        case 'APPROVED':
        case 'DISPATCHED':
          return {
            title: 'Work Order Approved!',
            description: `Everything looks good. We've approved your requested time without any changes.\n\nAppointment confirmation has been sent to ${workOrder.contact.email}.`,
            icon: CheckCircle2,
            iconColor: 'text-green-400',
            bgColor: 'bg-green-500/20',
            borderColor: 'border-green-500/40',
            showScheduling: true
          };
        case 'SCHEDULED':
          return {
            title: 'Work Order Submitted!',
            description: `The appointment is created in our system, we're double checking everything. We'll send confirmation to ${workOrder.contact.email} shortly.`,
            icon: CheckCircle,
            iconColor: 'text-[#00D6AF]',
            bgColor: 'bg-[#00D6AF]/20',
            borderColor: 'border-[#00D6AF]/40',
            showScheduling: true
          };
        default:
          return {
            title: 'Work Order Processed!',
            description: 'Your work order has been processed.',
            icon: CheckCircle,
            iconColor: 'text-green-400',
            bgColor: 'bg-green-500/20',
            borderColor: 'border-green-500/40',
            showScheduling: true
          };
      }
    };

    const statusMessage = getStatusMessage();
    const StatusIcon = statusMessage.icon;

    return (
      <div className={`p-4 rounded-2xl ${statusMessage.bgColor} backdrop-blur-md border ${statusMessage.borderColor}`}>
        <div className="text-center space-y-4">
          <StatusIcon className={`h-16 w-16 ${statusMessage.iconColor} mx-auto`} />
          <div>
            <h3 className="text-xl font-bold text-white">{statusMessage.title}</h3>
            <div className="text-white/80 mt-2">
              {statusMessage.description.split('\n').map((line, index) => (
                <p key={index} className={index > 0 ? 'mt-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
            {statusMessage.showScheduling && displayDate && (
              <p className="text-white/90 mt-2 font-medium">
                Scheduled for: {formatScheduledDate(displayDate)}
              </p>
            )}
            {statusMessage.showScheduling && displayArrivalWindow && (
              <div className="mt-2 space-y-1">
                <p className="text-white/80 font-medium">
                  Arrival Window: {displayArrivalWindow}
                </p>
                {selectedSlot && (
                  <p className="text-white/70 text-sm">
                    Time on Site: {formatWorkDuration(selectedSlot)}
                  </p>
                )}
              </div>
            )}
            <p className="text-white/60 text-sm mt-2">
              This work order is now locked and cannot be modified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Work Order Summary */}
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">Ready to Schedule?</h3>
        <p className="text-white/80 text-sm">
          Work Order: {workOrder.workOrderName} - {formatCurrency(totalAmount || 0)}
        </p>
      </div>

      {/* Calendar Selection */}
      <CalendarAvailability
        bookingType="workorders"
        selectedSlot={selectedSlot}
        onSlotSelect={setSelectedSlot}
        isScheduled={isScheduled}
        scheduledDate={scheduledDate}
      />

      {/* Notes */}
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
        <label className="block text-white/80 text-sm font-medium">
          Notes (optional):
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any specific instructions or details for the service team..."
          rows={3}
          className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-[#00D6AF] focus:border-transparent transition-colors duration-200 resize-none"
        />
      </div>

      {/* Action Button */}
      {selectedSlot ? (
        <div className="flex justify-center">
          <button
            onClick={handleScheduleWorkOrder}
            disabled={isSubmitting}
            className="w-full max-w-md bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white border-0 h-12 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Scheduling...' : 'Schedule Work Order'}
            </div>
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60">Please select a date and time to continue</p>
        </div>
      )}

      {/* Work Order Info */}
      <div className="text-center text-sm text-white/60 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-white/70" />
          <span>Estimated Duration: {Math.ceil((totalDuration || 0) / 60)} hours</span>
        </div>
        <p>You'll receive an email confirming your appointment details</p>
      </div>
    </div>
  );
}

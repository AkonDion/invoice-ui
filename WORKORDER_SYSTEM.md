# Work Order System

A complete work order scheduling system that allows users to schedule work orders without service selection, similar to the booking system but focused on work order management. Includes calendar integration, HST calculation, arrival windows, and webhook notifications.

## Features

### Database Schema
- **`workorders`** table - Main work order sessions
- **`workorder_line_items`** table - Service and part line items
- **`workorder_appointments`** table - Associated appointments

### API Endpoints
- **`POST /api/create-workorder`** - Create work order session from payload
- **`GET /api/workorder/refetch`** - Fetch work order data by token
- **`POST /api/workorder/update`** - Update scheduled date and notes
- **`GET /api/calendar/availability?type=workorders`** - Fetch available time slots for work orders

### UI Components
- **WorkOrderHeader** - Contact information and work order details (split into Service Address and Billing Address)
- **WorkOrderDetails** - Service and part line items display
- **WorkOrderTotalsPanel** - Financial summary with HST calculation (13%)
- **WorkOrderActions** - Date selection and scheduling with calendar integration
- **WorkOrderCard** - Main container component
- **WorkOrderCardWithRefetch** - Wrapper with data fetching
- **CalendarAvailability** - Full calendar component for date/time selection
- **CalendarDatePicker** - Compact calendar dropdown for forms

### Pages
- **`/workorder/[token]`** - Main work order page
- **`/test-workorder`** - Test page for creating work orders

## Usage

### 1. Create Work Order
Send a POST request to `/api/create-workorder` with the work order payload:

```json
{
  "workOrderId": "24404000000876248",
  "workOrderName": "WO212",
  "status": "Completed",
  "type": "Installation",
  "grandTotal": 21011.921,
  "subTotal": 18594.62,
  "taxAmount": 2417.301,
  "billingStatus": "Invoiced",
  "quickbooksInvoiceId": "9314",
  "quickbooksInvoiceNumber": "1698",
  "saleOrderId": "9225",
  "contact": {
    "id": "24404000000841201",
    "name": "Nikolas Fehr",
    "email": "nikolas.fehr@gmail.com",
    "phone": "604-839-2431"
  },
  "serviceAddress": {
    "id": "24404000000849556",
    "street": "10 Blue Spruce Court",
    "city": "Ottawa",
    "state": "Ontario",
    "postal": "K1B 3E4",
    "country": "Canada"
  },
  "billingAddress": {
    "id": "24404000000849557",
    "street": "10 Blue Spruce Court",
    "city": "Ottawa",
    "state": "Ontario",
    "postal": "K1B 3E4",
    "country": "Canada"
  },
  "serviceLineItems": [...],
  "partLineItems": [...],
  "appointments": [...]
}
```

### 2. Access Work Order
The API returns a URL like: `/workorder/{token}`

### 3. User Experience
- View contact information (service and billing addresses in separate cards)
- See work order details (services, parts, appointments)
- Review financial summary with HST calculation (13%)
- Select preferred date and time from calendar
- Add optional notes
- Schedule the work order
- Receive confirmation with arrival window (1-hour window)

## Key Differences from Booking System

1. **No Service Selection** - Work orders come with predefined line items
2. **Date/Time Selection** - Users choose when to schedule the work using calendar
3. **Work Order Details** - Shows services, parts, and appointments
4. **Financial Summary** - Displays work order totals with HST (13%)
5. **Notes Field** - Allows additional instructions
6. **Arrival Windows** - Shows 1-hour arrival window for scheduling
7. **Webhook Integration** - Sends notifications to external webhook on scheduling

## Database Migration

Run the migration to create the required tables:

```sql
-- See: supabase/migrations/002_create_workorders.sql
```

## Testing

Visit `/test-workorder` to create a test work order with sample data and get a URL to view it.

## Calendar Integration

### Features
- **External Webhook Integration**: Fetches availability from `https://nodechain.dev/webhook/4905f161-d220-4ea5-91cc-9b64f159e924`
- **Timezone Conversion**: Automatically converts UTC times to Toronto EDT
- **Progressive Loading**: Shows 1 week at a time with "Show More" button
- **Intuitive UI**: After time selection, hides other dates and shows only selected time with "Change Time" option
- **Arrival Windows**: Displays 1-hour arrival window (e.g., 8:00 AM - 9:00 AM)

### Calendar API
- **Endpoint**: `GET /api/calendar/availability?type=workorders`
- **Types**: `booking` and `workorders` (different availability slots)
- **Response**: Formatted time slots with Toronto timezone

## HST Calculation

- **Rate**: 13% HST (Harmonized Sales Tax)
- **Display**: Shows subtotal, HST amount, and total with HST
- **Applied to**: All work orders

## Webhook Integration

### Success Notification
- **Endpoint**: `https://nodechain.dev/webhook/d4f57f3f-dd70-4776-843e-a3ec4f56a003`
- **Trigger**: When work order is successfully scheduled
- **Payload**: Includes `contactId`, `workOrderId`, `arrivalWindow`, and scheduling details

## Recent Updates & Features

### Calendar System
- **Full Calendar Integration**: `CalendarAvailability` component with external webhook
- **Progressive Loading**: Shows 1 week at a time with "Show More" button
- **Intuitive UI**: After time selection, hides other dates and shows only selected time
- **Timezone Conversion**: Automatic UTC to Toronto EDT conversion
- **Change Time Option**: "Change Time" button to return to full calendar view

### HST Calculation
- **13% HST**: Applied to all work orders
- **Clear Display**: Shows subtotal, HST amount, and total with HST
- **Consistent**: Applied across both booking and work order systems

### Arrival Windows
- **1-Hour Windows**: Displays arrival window (e.g., 8:00 AM - 9:00 AM)
- **Visual Distinction**: Blue glassmorphic card for arrival window display
- **Success Modal**: Shows arrival window in confirmation message

### Webhook Integration
- **Success Notifications**: Sends payload to external webhook on scheduling
- **Rich Payload**: Includes `contactId`, `workOrderId`, `arrivalWindow`, and scheduling details
- **Error Handling**: Graceful handling of webhook failures

### UI Improvements
- **Split Address Cards**: Service Address and Billing Address in separate cards
- **Glassmorphic Design**: Consistent styling across all components
- **Clean Interface**: Focused on scheduling with calendar integration
- **Success Modals**: Styled confirmation messages with arrival windows

### Database Schema
- **Three Tables**: `workorders`, `workorder_line_items`, `workorder_appointments`
- **Migration**: `002_create_workorders.sql` with complete schema
- **UUID Support**: Uses UUIDs for work order IDs

## Styling

Uses the same glassmorphic design system as the booking system for consistency.

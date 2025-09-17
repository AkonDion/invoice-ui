# Booking System Documentation

This document describes the booking system implementation that extends the existing invoice UI with service scheduling functionality.

## Overview

The booking system allows customers to select and schedule services through a token-based URL system, similar to the existing invoice system. It reuses the invoice UI components and styling while providing booking-specific functionality. The system includes calendar integration for date/time selection, HST calculation, and webhook integration for external notifications.

## Architecture

### Database Schema

#### `booking_sessions` Table
```sql
CREATE TABLE booking_sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  contact_id VARCHAR(255) NOT NULL,  -- Changed to VARCHAR to match customers.contactid
  fsm_id VARCHAR(255) NOT NULL,      -- Changed to VARCHAR to match services.id (UUID)
  status VARCHAR(50) DEFAULT 'ACTIVE',
  selected_services INTEGER[] DEFAULT '{}',
  scheduled_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);
```

### API Endpoints

#### `POST /api/create-booking`
Creates a new booking session and returns a booking URL.

**Request Body:**
```json
{
  "contactid": "24404000000841201",
  "fsm_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "url": "https://billing.comforthub.ca/booking/abc123...",
  "token": "abc123...",
  "contact": {
    "id": "24404000000841201",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main St",
    "city": "Toronto",
    "province": "ON",
    "postalCode": "M1A 1A1",
    "country": "Canada"
  },
  "fsm_id": "550e8400-e29b-41d4-a716-446655440000",
  "services_count": 5,
  "expires_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /api/booking/refetch?token=abc123...`
Refetches booking data for real-time updates.

#### `POST /api/booking/update`
Updates booking session with selected services.

**Request Body:**
```json
{
  "token": "abc123...",
  "selectedServices": [1, 2, 3],
  "scheduledDate": "2024-01-15T10:30:00Z",
  "notes": "Please call before arriving"
}
```

#### `GET /api/calendar/availability?type=booking`
Fetches available time slots for service bookings.

**Response:**
```json
{
  "success": true,
  "slots": [
    {
      "start": "2024-01-15T08:00:00-04:00",
      "end": "2024-01-15T16:00:00-04:00",
      "date": "2024-01-15",
      "label": "8:00 AM-4:00 PM"
    }
  ]
}
```

### Routes

#### `/booking/[token]`
Main booking page where customers select services.

#### `/booking/success`
Success page shown after booking completion.

#### `/test-booking`
Test page for creating booking sessions during development.

## Components

### Core Components

- **`BookingRefetchProvider`**: Context provider for real-time booking updates
- **`BookingCard`**: Main booking interface container
- **`BookingHeader`**: Contact information display (split into Service Address and Billing Address cards)
- **`ServiceSelector`**: Service selection interface
- **`ServiceCard`**: Individual service selection card
- **`BookingTotalsPanel`**: Selected services summary with HST calculation (13%)
- **`BookingActions`**: Booking completion actions with calendar integration
- **`CalendarAvailability`**: Full calendar component for date/time selection
- **`CalendarDatePicker`**: Compact calendar dropdown for forms

### Reused Components

The booking system reuses many components from the invoice system:
- UI components from `components/ui/`
- Styling and layout patterns
- Background and glassmorphic design
- Error handling patterns

## Usage

### Creating a Booking Session

1. Call the `/api/create-booking` endpoint with `contactid` and `fsm_id`
2. The API returns a unique booking URL
3. Send the URL to the customer
4. Customer accesses the booking interface at the URL

### Customer Experience

1. Customer clicks booking link
2. Sees their contact information (Service Address and Billing Address)
3. Browses available services for their FSM
4. Selects desired services
5. Reviews booking summary with HST calculation
6. Selects preferred date and time from calendar
7. Schedules booking
8. Receives confirmation with arrival window (for work orders)

## Database Requirements

### Required Tables

1. **`customers`** - Customer contact information (uses `contactid` as primary key)
2. **`services`** - Available services with FSM association (uses UUID as primary key)
3. **`booking_sessions`** - Booking session data (created by migration)

### Sample Data

```sql
-- Sample customer
INSERT INTO customers (contactid, name, email, phone, address, city, province, postal_code, country) 
VALUES ('24404000000841201', 'John Doe', 'john@example.com', '555-1234', '123 Main St', 'Toronto', 'ON', 'M1A 1A1', 'Canada');

-- Sample service
INSERT INTO services (id, name, description, price, duration, fsm_id, is_active) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'HVAC Maintenance', 'Complete HVAC system maintenance', 150.00, 120, 'fsm-123', true);
```

## Testing

### Test Page
Visit `/test-booking` to create test booking sessions.

### Manual Testing
1. Create a booking session using the test page
2. Open the returned URL
3. Select services and verify updates
4. Test booking completion flow

## Security

- Booking tokens are cryptographically secure (16 bytes hex)
- Sessions expire after 7 days
- RLS policies protect database access
- Input validation on all API endpoints

## Calendar Integration

### Features
- **External Webhook Integration**: Fetches availability from `https://nodechain.dev/webhook/4905f161-d220-4ea5-91cc-9b64f159e924`
- **Timezone Conversion**: Automatically converts UTC times to Toronto EDT
- **Progressive Loading**: Shows 1 week at a time with "Show More" button
- **Intuitive UI**: After time selection, hides other dates and shows only selected time with "Change Time" option
- **Arrival Windows**: For work orders, displays 1-hour arrival window (e.g., 8:00 AM - 9:00 AM)

### Calendar API
- **Endpoint**: `GET /api/calendar/availability?type=booking`
- **Types**: `booking` and `workorders` (different availability slots)
- **Response**: Formatted time slots with Toronto timezone

## HST Calculation

- **Rate**: 13% HST (Harmonized Sales Tax)
- **Display**: Shows subtotal, HST amount, and total with HST
- **Applied to**: All service bookings and work orders

## Future Enhancements

- Email notifications
- Payment integration for deposits
- Service availability checking
- Recurring booking support
- Mobile app integration

## Troubleshooting

### Common Issues

1. **"Contact not found"** - Verify contact exists in database
2. **"No active services found"** - Check services table and FSM association
3. **"Booking session expired"** - Session expired after 7 days
4. **UI not loading** - Check token validity and database connection

### Debug Logging

The system includes comprehensive logging:
- API request/response logging
- Database query logging
- Error tracking
- Performance monitoring

## Recent Updates & Features

### Calendar System
- **Full Calendar Integration**: `CalendarAvailability` component with external webhook
- **Progressive Loading**: Shows 1 week at a time with "Show More" button
- **Intuitive UI**: After time selection, hides other dates and shows only selected time
- **Timezone Conversion**: Automatic UTC to Toronto EDT conversion
- **Change Time Option**: "Change Time" button to return to full calendar view

### HST Calculation
- **13% HST**: Applied to all service bookings
- **Clear Display**: Shows subtotal, HST amount, and total with HST
- **Consistent**: Applied across both booking and work order systems

### UI Improvements
- **Split Address Cards**: Service Address and Billing Address in separate cards
- **Glassmorphic Design**: Consistent styling across all components
- **Removed Elements**: "Request Quote" button and refresh functionality removed
- **Clean Interface**: Focused on scheduling with calendar integration

### Database Updates
- **Schema Changes**: Updated to use `customers` table with `contactid` and `services` table with UUID
- **Migration**: `001_create_booking_sessions.sql` with correct data types

## Migration

To set up the booking system:

1. Run the database migration: `001_create_booking_sessions.sql`
2. Deploy the new API endpoints
3. Deploy the booking UI components
4. Test with sample data
5. Configure production environment variables

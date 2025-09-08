# Glassmorphic Invoice Landing Page

A beautiful, modern invoice landing page built with Next.js 14, featuring a glassmorphic design and real-time data integration.

## Features

- 🎨 **Glassmorphic Design**: Modern UI with backdrop blur effects and translucent elements
- 📱 **Responsive Layout**: Optimized for desktop and mobile devices
- 🔄 **Real-time Data**: Consumes live invoice data from external APIs
- ✅ **Type Safety**: Full TypeScript support with Zod validation
- 🎯 **SEO Optimized**: Server-side rendering for better performance
- 💳 **HelcimPay Integration**: Full payment processing with HelcimPay.js
- 🏢 **Existing Invoice Support**: Links to existing Helcim invoices via invoice number

## Data Flow

The application follows a clean data flow architecture:

```
URL Token → API Proxy → Zod Validation → UI Components
```

### 1. URL Structure
- Invoice pages are accessed via `/invoice/[token]`
- The token is extracted from the URL parameters
- Example: `/invoice/8ae0161ec777ad250da6e3`

### 2. API Proxy (`/api/invoices/[token]`)
- Server-side route that proxies requests to external invoice API
- Handles authentication with API keys
- Implements proper error handling and timeouts
- Validates response data with Zod schemas

### 3. Data Validation
- Uses Zod schemas to validate incoming data structure
- Ensures type safety throughout the application
- Handles malformed data gracefully

### 4. UI Components
- Server-side rendered pages for better SEO
- Components consume validated `InvoicePayload` data
- Conditional rendering based on data availability
- Empty field handling for addresses and optional data

## Environment Configuration

Create a `.env.local` file based on `.env.local.example`:

```bash
# Invoice API Configuration
INVOICE_API_URL=https://your-backend.example.com/invoices/by-token
INVOICE_API_KEY=your_api_key_here

# Helcim Payment Configuration
HELCIM_API_TOKEN=your_helcim_api_token_here

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## HelcimPay Integration

The application includes full HelcimPay.js integration for processing payments on existing Helcim invoices:

### **How It Works:**
1. **Invoice Token** (`8ae0161ec777ad250da6e3`) - Your internal system identifier
2. **Invoice Number** (`1687`) - Helcim's invoice identifier (used for payment processing)
3. **Customer Data** - Billing address and contact information passed to Helcim
4. **Payment Flow** - Server-side initialization → HelcimPay modal → Payment processing

### **Key Parameters:**
- `invoiceNumber`: Links to existing Helcim invoice (e.g., "1687")
- `customerCode`: Links to existing customer (`CUST_${customerId}`)
- `amount`: Payment amount from invoice data
- `currency`: Currency from invoice data (CAD/USD)
- `hasConvenienceFee`: Enables convenience fees if configured
- `allowPartialPayment`: Allows partial payments
- `metadata`: Includes invoice token and source tracking

### **Payment Flow:**
```
User clicks "Pay Now" → API calls Helcim → HelcimPay modal opens → Payment processed → Success/Error handling
```

## API Integration

The application expects the external API to return an array with one invoice object in the following format:

```typescript
[
  {
    "invoiceId": number,
    "invoiceNumber": string,
    "token": string,
    "tipAmount": number,
    "depositAmount": number,
    "notes": string,
    "dateCreated": string,
    "dateUpdated": string,
    "datePaid": string, // "0000-00-00 00:00:00" if unpaid
    "dateIssued": string,
    "status": "DUE" | "PAID" | "PARTIAL" | "VOID" | "REFUNDED" | "DRAFT" | "SENT",
    "customerId": number,
    "amount": number,
    "amountPaid": number,
    "amountDue": number,
    "currency": "CAD" | "USD",
    "type": "INVOICE",
    "convenienceFee": number,
    "convenienceFeeEnabled": boolean,
    "orderFields": any[],
    "billingAddress": {
      "name": string,
      "street1": string,
      "street2": string,
      "city": string,
      "province": string,
      "country": string,
      "postalCode": string,
      "phone": string,
      "email": string
    },
    "shipping": {
      "amount": number,
      "details": string,
      "address": { /* same structure as billingAddress */ }
    },
    "lineItems": [
      {
        "sku": string,
        "description": string,
        "quantity": number,
        "price": number,
        "total": number,
        "taxAmount": number,
        "discountAmount": number
      }
    ],
    "pickup": {
      "name": string,
      "date": string
    },
    "tax": {
      "details": string,
      "amount": number
    },
    "discounts": {
      "details": string,
      "amount": number
    }
  }
]
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

### Key Files

- `types/invoice.ts` - TypeScript types and Zod schemas
- `lib/invoice/adapter.ts` - Data normalization and utility functions
- `app/api/invoices/[token]/route.ts` - API proxy endpoint
- `app/invoice/[token]/page.tsx` - Server-side rendered invoice page
- `components/` - Reusable UI components

### Error Handling

- **404**: Invoice not found - displays friendly error message
- **502**: API errors - shows retry option
- **Validation errors**: Malformed data - logs error and shows fallback
- **Network timeouts**: 10-second timeout with proper error handling

### Loading States

- Skeleton loading screens with glassmorphic design
- Maintains visual consistency during data fetching
- Responsive loading states for all screen sizes

## Styling

- **Primary Accent**: `#00D6AF` (teal green)
- **Design System**: Glassmorphic with backdrop blur
- **Typography**: Clean, modern font stack
- **Responsive**: Mobile-first design approach

## License

MIT License - see LICENSE file for details.

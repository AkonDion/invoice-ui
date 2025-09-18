import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

// Import error suppression for production
import '@/lib/error-suppression'

export const metadata: Metadata = {
  title: 'Comfort Hub Checkout',
  description: 'Secure payment processing for Comfort Hub invoices',
  generator: 'Next.js',
  icons: {
    icon: '/Vector (2).png',
    apple: '/Vector (2).png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}

// Error suppression for production environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Suppress unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
    // Silently handle the error without logging
  })

  // Suppress uncaught errors
  window.addEventListener('error', (event) => {
    event.preventDefault()
    // Silently handle the error without logging
  })

  // Override console.error in production to suppress React errors
  const originalConsoleError = console.error
  console.error = (...args: any[]) => {
    // Only suppress React minified errors and Vercel Analytics errors
    const message = args[0]?.toString() || ''
    if (
      message.includes('Minified React error') ||
      message.includes('Vercel Web Analytics') ||
      message.includes('Failed to load script from /_vercel/insights/script.js')
    ) {
      return // Suppress these specific errors
    }
    // Allow other errors to be logged
    originalConsoleError.apply(console, args)
  }

  // Override console.warn to suppress Vercel Analytics warnings
  const originalConsoleWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    if (
      message.includes('Vercel Web Analytics') ||
      message.includes('Failed to load script from /_vercel/insights/script.js')
    ) {
      return // Suppress these specific warnings
    }
    // Allow other warnings to be logged
    originalConsoleWarn.apply(console, args)
  }
}

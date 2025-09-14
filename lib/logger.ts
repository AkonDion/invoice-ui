/* eslint-disable no-console */
const isProd = process.env.NODE_ENV === 'production';

type Any = unknown[];
function redactArg(arg: unknown): unknown {
  if (typeof arg !== 'string') return arg;
  // Redact common secrets/PII tokens if they appear in log strings
  return arg
    // Secrets & tokens
    .replace(/(api[_-]?key|secret|token|auth|authorization|bearer|session|cookie|set-cookie)\s*[:=]\s*[^,\s]+/gi, '$1=[REDACTED]')
    // Payment & banking identifiers (non-exhaustive)
    .replace(/\b(?:card|cc|pan|iban|routing|transit|ach|cvv|cvc|exp(?:iry|iration)?|sin|ssn)\b[\s:=]*[^\s,]+/gi, '$1=[REDACTED]')
    // Emails & simple IDs
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
}

function print(fn: (...a: Any) => void, ...args: Any) {
  const safe = args.map(redactArg);
  fn(...safe);
}

export const log = {
  debug: (..._args: Any) => { if (!isProd) print(console.debug, ..._args); },
  info:  (..._args: Any) => { if (!isProd) print(console.info,  ..._args); },
  warn:  (...args: Any)   => { print(console.warn,  ...args); },
  error: (...args: Any)   => { print(console.error, ...args); },
} as const;

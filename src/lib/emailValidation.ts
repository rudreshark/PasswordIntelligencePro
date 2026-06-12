// Email validation utilities for PassIntell Pro

// Common disposable email domains (short list for demo purposes)
const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com",
  "throwaway.com",
  "guerrillamail.com",
  "10minutemail.com",
  "temp-mail.org",
  "mailinator.com",
  "trashmail.com",
  "tempemail.com",
  "fakeinbox.com"
];

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if email is from a disposable domain
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

// Full email validation
export function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email.trim()) {
    return { valid: false, message: "Email is required" };
  }
  
  if (!isValidEmail(email)) {
    return { valid: false, message: "Invalid email format" };
  }
  
  if (isDisposableEmail(email)) {
    return { valid: false, message: "Disposable email addresses are not allowed" };
  }
  
  return { valid: true, message: "Email is valid" };
}

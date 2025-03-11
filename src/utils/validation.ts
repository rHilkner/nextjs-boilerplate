/**
 * Validation utility functions
 */

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid password
 * At least 8 characters, at least 1 uppercase, 1 lowercase, and 1 number
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Check if a string is a valid phone number
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // This is a basic validation - adjust for specific country formats if needed
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Check if a string is a valid credit card number (using Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove spaces and dashes
  const sanitizedNumber = cardNumber.replace(/[\s\-]/g, '');
  
  // Check if it contains only digits
  if (!/^\d+$/.test(sanitizedNumber)) {
    return false;
  }
  
  // Apply Luhn algorithm
  const digits = sanitizedNumber.split('').map(Number);
  for (let i = digits.length - 2; i >= 0; i -= 2) {
    let double = digits[i] * 2;
    if (double > 9) {
      double = double - 9;
    }
    digits[i] = double;
  }
  
  const sum = digits.reduce((acc, digit) => acc + digit, 0);
  return sum % 10 === 0;
}
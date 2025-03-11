/**
 * Storage utility functions for working with browser storage
 */

/**
 * Get an item from localStorage with expiration check
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    
    const item = JSON.parse(itemStr);
    
    // Check if item has expiration and if it's expired
    if (item.expiry && new Date().getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    console.error('Error getting item from localStorage:', error);
    return null;
  }
}

/**
 * Set an item in localStorage with optional expiration
 */
export function setStorageItem<T>(
  key: string,
  value: T,
  expiryInMinutes?: number
): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const item = {
      value,
      expiry: expiryInMinutes
        ? new Date().getTime() + expiryInMinutes * 60 * 1000
        : null,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting item in localStorage:', error);
  }
}

/**
 * Remove an item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from localStorage:', error);
  }
}

/**
 * Clear all items from localStorage
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get an item from sessionStorage
 */
export function getSessionItem<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    
    return JSON.parse(itemStr);
  } catch (error) {
    console.error('Error getting item from sessionStorage:', error);
    return null;
  }
}

/**
 * Set an item in sessionStorage
 */
export function setSessionItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting item in sessionStorage:', error);
  }
}

/**
 * Remove an item from sessionStorage
 */
export function removeSessionItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from sessionStorage:', error);
  }
}
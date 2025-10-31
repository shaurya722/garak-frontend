import { STORAGE_KEYS } from "@/constants";

/**
 * Safe localStorage wrapper
 */
export const storage = {
  /**
   * Get item from localStorage
   */
  get: <T = string>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const item = window.localStorage.getItem(key);
      if (!item || item.trim() === "") return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   */
  set: (key: string, value: unknown): boolean => {
    if (typeof window === "undefined") return false;
    
    try {
      const serializedValue = typeof value === "string" 
        ? value 
        : JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   */
  clear: (): boolean => {
    if (typeof window === "undefined") return false;
    
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};

/**
 * Auth-specific storage helpers
 */
export const authStorage = {
  getToken: (): string | null => storage.get(STORAGE_KEYS.TOKEN),
  setToken: (token: string): boolean => storage.set(STORAGE_KEYS.TOKEN, token),
  removeToken: (): boolean => storage.remove(STORAGE_KEYS.TOKEN),
  
  getTenantId: (): string | null => storage.get(STORAGE_KEYS.TENANT_ID),
  setTenantId: (tenantId: string): boolean => storage.set(STORAGE_KEYS.TENANT_ID, tenantId),
  removeTenantId: (): boolean => storage.remove(STORAGE_KEYS.TENANT_ID),
  
  clearAuth: (): void => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.TENANT_ID);
  },
};

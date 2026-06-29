import type { StorageAdapter } from "./types";

class BrowserStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor(storageType: "localStorage" | "sessionStorage" = "localStorage") {
    if (typeof window === "undefined") {
      throw new Error("BrowserStorageAdapter can only be used in browser environment");
    }
    this.storage = window[storageType];
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch {
      // Silently fail
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      // Silently fail
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch {
      // Silently fail
    }
  }
}

class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

export const createStorageAdapter = (
  type: "localStorage" | "sessionStorage" | "memory" = "localStorage"
): StorageAdapter => {
  if (typeof window === "undefined" || type === "memory") {
    return new MemoryStorageAdapter();
  }
  return new BrowserStorageAdapter(type);
};

export const defaultStorage = createStorageAdapter();
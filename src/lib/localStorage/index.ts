import { LocalStorageType } from './index.d'

const localStorage: LocalStorageType = {
  setItem: (key, value) => {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    window.localStorage.setItem(key, value);
  },

  getItem: (key) => {
    const value =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(key)
        : "";

    try {
      if (value) {
        return value;
      } else {
        return null;
      }
    } catch (error) {
      return value;
    }
  },

  removeItem: (key) => {
    window.localStorage.removeItem(key);
  },

  clear: () => {
    window.localStorage.clear();
  },
};

export default localStorage;

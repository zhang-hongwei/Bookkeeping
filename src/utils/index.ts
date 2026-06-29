// Pagination utility function
export const formatPaginationParams = (params: Record<string, any>) => {
  // Default pagination parameters
  const defaultParams = {
    page: 1,
    pageSize: 10,
    ...params
  };
  
  return defaultParams;
};

// Table request formatting utility
export const formatTableRequest = async (apiFunction: Function, params: Record<string, any>) => {
  try {
    const response = await apiFunction(params);
    return response;
  } catch (error) {
    console.error('Table request failed:', error);
    throw error;
  }
};

// Check if a function is async
export const isAsyncFunction = (fn: any): boolean => {
  if (typeof fn !== 'function') {
    return false;
  }
  
  // Check if it's an async function
  if (fn.constructor.name === 'AsyncFunction') {
    return true;
  }
  
  // Check if it returns a Promise
  try {
    const result = fn();
    return result && typeof result.then === 'function';
  } catch (error) {
    return false;
  }
};

// Re-export other utilities
export { default as convertParamsToQueryString } from './convertParamsToQueryString';
// Suppress known MUI warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Received `true` for a non-boolean attribute `font`')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}

export {};

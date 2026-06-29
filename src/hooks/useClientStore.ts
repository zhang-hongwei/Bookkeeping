import { useEffect, useState } from 'react';
import { useStore as useZustandStore } from '@/store';

// Client-only wrapper to prevent SSR issues
export function useClientStore<T>(
  selector: (state: ReturnType<typeof useZustandStore.getState>) => T
): T | null {
  const [mounted, setMounted] = useState(false);
  const storeData = useZustandStore(selector);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return storeData;
}
'use client';

import { useEffect } from 'react';
import { initializeStore } from '@/store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      initializeStore();
    }
  }, []);

  return <>{children}</>;
}
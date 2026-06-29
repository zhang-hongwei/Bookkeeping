// 环境变量相关
export const isServerMode = typeof window === 'undefined';
export const isClientMode = typeof window !== 'undefined';
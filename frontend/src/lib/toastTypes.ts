import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';

export interface ToastPayload {
  type?: ToastType;
  title: string;
  message?: string;
  image?: string;
  icon?: ReactNode;
  timestamp?: string;
  duration?: number;
  id?: string;
}

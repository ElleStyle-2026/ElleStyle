import toast from 'react-hot-toast';
import React from 'react';
import { CustomToast } from '../components/ui/CustomToast';
import type { ToastPayload, ToastType } from './toastTypes';

const formatTimestamp = () => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date());
};

const createToast = (type: ToastType, payload: Omit<ToastPayload, 'type'>) => {
  const fullPayload: ToastPayload = {
    ...payload,
    type,
    timestamp: payload.timestamp || formatTimestamp(),
  };

  const options: any = {
    duration: payload.duration || (type === 'error' ? 5000 : type === 'loading' ? Infinity : 3000),
    id: payload.id, // Explicit ID for deduplication and updating loading toasts
  };

  return toast.custom(
    (t) => React.createElement(CustomToast, { t, payload: fullPayload, onDismiss: () => toast.dismiss(t.id) }),
    options
  );
};

export const showToast = {
  success: (payload: Omit<ToastPayload, 'type'>) => createToast('success', payload),
  error: (payload: Omit<ToastPayload, 'type'>) => createToast('error', payload),
  warning: (payload: Omit<ToastPayload, 'type'>) => createToast('warning', { duration: 4000, ...payload }),
  info: (payload: Omit<ToastPayload, 'type'>) => createToast('info', payload),
  loading: (payload: Omit<ToastPayload, 'type'>) => createToast('loading', payload),
  custom: (payload: Omit<ToastPayload, 'type'>) => createToast('custom', payload),

  // Semantic Helpers
  productAdded: (productName: string, image?: string) => 
    createToast('success', { title: 'Added to your bag', message: productName, image }),
  productRemoved: (productName: string, image?: string) => 
    createToast('info', { title: 'Removed from bag', message: productName, image }),
  wishlistAdded: (productName: string, image?: string) => 
    createToast('success', { title: 'Added to your wishlist', message: productName, image }),
  wishlistRemoved: (productName: string, image?: string) => 
    createToast('info', { title: 'Removed from wishlist', message: productName, image }),
  uploadSuccess: (message: string) => 
    createToast('success', { title: 'Upload successful', message }),
  uploadFailed: (message: string) => 
    createToast('error', { title: 'Upload failed', message }),
  orderSuccess: () => 
    createToast('success', { 
      title: 'Order placed successfully! 🎉', 
      message: 'Your order has been confirmed.',
      duration: 6000 
    }),
  
  dismiss: (id?: string) => toast.dismiss(id),
};

import { showToast } from './toast';
import type { ToastPayload } from './toastTypes';

const adminToast = {
  success: (message: string, options?: any) => showToast.success({ title: 'Success', message, id: options?.id }),
  error: (message: string, options?: any) => showToast.error({ title: 'Error', message, id: options?.id }),
  loading: (message: string, options?: any) => showToast.loading({ title: 'Please wait', message, id: options?.id }),
  dismiss: (id?: string) => {
    // We can't directly dismiss via showToast yet, let's import toast to dismiss
    const { toast } = require('react-hot-toast');
    toast.dismiss(id);
  }
};

export default adminToast;
import { showToast } from './toast';
import toast from 'react-hot-toast';

const adminToast = {
  success: (message: string, options?: any) => showToast.success({ title: 'Success', message, id: options?.id }),
  error: (message: string, options?: any) => showToast.error({ title: 'Error', message, id: options?.id }),
  loading: (message: string, options?: any) => showToast.loading({ title: 'Please wait', message, id: options?.id }),
  dismiss: (id?: string) => {
    toast.dismiss(id);
  }
};

export default adminToast;
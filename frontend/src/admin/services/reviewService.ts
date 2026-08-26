// @ts-nocheck
import { apiClient } from '@/lib/apiClient';
export interface AdminReview {
  _id: string;
  product: { _id: string; name: string };
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  date: string;
  media?: { url: string; type: 'image' | 'video' }[];
  images?: string[]; // Legacy fallback
}

export const adminReviewService = {
  getReviews: async (): Promise<AdminReview[]> => {
    const res = await apiClient('/api/v1/admin/reviews');
    const json = res;
    return json.data;
  },

  updateReviewStatus: async (id: string, status: 'approved' | 'rejected'): Promise<AdminReview> => {
    const res = await apiClient(`/api/v1/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = res;
    return json.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    const res = await apiClient(`/api/v1/admin/reviews/${id}`, {
      method: 'DELETE'
    });
  },

  createReview: async (data: any): Promise<AdminReview> => {
    const res = await apiClient(`/api/v1/admin/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = res;
    return json.data;
  }
};

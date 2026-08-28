import { type TestimonialShowcase } from '../../services/publicTestimonialShowcaseService';
import { apiClient } from '@/lib/apiClient';

export const getAdminTestimonialShowcases = async (): Promise<TestimonialShowcase[]> => {
  const response = await apiClient('/api/v1/admin/testimonial-showcase');
  return response.data;
};

export const createAdminTestimonialShowcase = async (showcase: Partial<TestimonialShowcase>): Promise<TestimonialShowcase> => {
  const response = await apiClient('/api/v1/admin/testimonial-showcase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(showcase),
  });
  return response.data;
};

export const updateAdminTestimonialShowcase = async (id: string, updates: Partial<TestimonialShowcase>): Promise<TestimonialShowcase> => {
  const response = await apiClient(`/api/v1/admin/testimonial-showcase/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteAdminTestimonialShowcase = async (id: string): Promise<void> => {
  await apiClient(`/api/v1/admin/testimonial-showcase/${id}`, {
    method: 'DELETE',
  });
};

export const reorderAdminTestimonialShowcase = async (items: { _id: string; order: number }[]): Promise<void> => {
  await apiClient('/api/v1/admin/testimonial-showcase/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
};

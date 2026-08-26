import { apiClient } from '../lib/apiClient';

export interface TestimonialShowcase {
  _id: string;
  customerName: string;
  customerProfileImage?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  badgeText?: string;
  review?: string; // review ID if linked
  isActive: boolean;
  order: number;
}

export const getPublicTestimonialShowcases = async (): Promise<TestimonialShowcase[]> => {
  const response = await apiClient('/api/v1/testimonial-showcase');
  return response.data;
};

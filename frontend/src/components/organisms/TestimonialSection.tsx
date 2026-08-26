import React, { useEffect, useState } from 'react';
import { SectionHeader } from '../molecules/SectionHeader';
import { ReviewVisualCard } from '../molecules/ReviewVisualCard';
import { getPublicTestimonialShowcases, type TestimonialShowcase } from '../../services/publicTestimonialShowcaseService';

export const TestimonialSection: React.FC = () => {
  const [showcases, setShowcases] = useState<TestimonialShowcase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        setIsLoading(true);
        const data = await getPublicTestimonialShowcases();
        setShowcases(data);
      } catch (error) {
        console.error('Failed to fetch testimonial showcases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowcases();
  }, []);

  if (!isLoading && showcases.length === 0) {
    return null; // Don't render section if there are no showcases
  }

  return (
    <section className="py-16 md:py-32 px-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="OUR REVIEWS"
          title="Loved by our customers,"
          titleAccent="trusted for our quality."
          rightContent={
            <div className="flex flex-col items-end gap-6 text-right w-full md:max-w-md ml-auto">
              <p className="font-sans text-[15px] leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>
                Real stories from real people. Every review is an unfiltered look at the pieces our community brings into their homes and everyday lives.
              </p>
              <div className="flex gap-3">
                <button aria-label="Previous review" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors bg-transparent cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <button aria-label="Next review" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors bg-transparent cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          }
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-accent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {showcases.map((showcase) => (
              <ReviewVisualCard
                key={showcase._id}
                mediaUrl={showcase.mediaUrl}
                mediaType={showcase.mediaType}
                badgeLabel={showcase.badgeText}
                userName={showcase.customerName}
                userAvatar={showcase.customerProfileImage}
                className="aspect-[4/5] md:aspect-[3/4]"
              />
            ))}
          </div>
        )}

        {/* Pagination Dots (Optional, if implementing slider logic later) */}
        {!isLoading && showcases.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
          </div>
        )}
      </div>
    </section>
  );
};

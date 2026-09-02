// @ts-nocheck
import { apiClient } from '@/lib/apiClient';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicCategories, type Category } from '../../services/publicCategoryService';

interface CircularCategoryCarouselProps {
  className?: string;
  activeCategorySlug?: string;
}

export const CircularCategoryCarousel: React.FC<CircularCategoryCarouselProps> = ({ 
  className = "w-full pt-28 md:pt-[128px] pb-6",
  activeCategorySlug
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchPublicCategories({ carousel: true }).then((cats) => {
      setCategories(cats);
    });
  }, []);

  return (
    <div
      className={`${className} relative`}
      style={{
        backgroundColor: 'var(--bg-page)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 overflow-x-auto scrollbar-hide">
        <div className="flex items-start justify-center min-w-max mx-auto py-6 md:py-8 gap-5 md:gap-8 xl:gap-10">
          {categories.map((category) => {
            const isActive = activeCategorySlug === category.slug;
            return (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group shrink-0"
                aria-label={`Browse ${category.name}`}
                data-cursor="explore"
                data-cursor-text="VIEW"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div
                    className={`relative overflow-hidden rounded-full border-[4px] bg-white transition-all duration-200 ${isActive ? 'border-[#03989E] shadow-[6px_6px_0_#03989E]' : 'border-[#03989E] shadow-[4px_4px_0_#03989E] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[6px_6px_0_#03989E]'}`}
                    style={{ width: '140px', height: '140px' }}
                  >
                    <img
                      src={category.image}
                      alt={`${category.name} category`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <span
                    className={`max-w-[170px] font-sans text-[13px] md:text-[14px] font-black leading-[1.1] tracking-[-0.03em] uppercase transition-colors duration-200 ${isActive ? 'text-[#03989E]' : 'text-[#1b2a2e]'}`}
                  >
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};


import React from 'react';

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
};

export const LegalPage: React.FC<LegalPageProps> = ({
  title,
  lastUpdated,
  intro,
  children,
}) => {
  return (
    <div className="bg-[#FCFAF8] text-[#2c2a28] font-sans min-h-screen">
      <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-16 lg:py-24">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#A67F5D] mb-4">
            Ellestyle India
          </p>
          <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl text-[#2c2a28] font-bold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#59524a] font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {intro && (
          <div className="mb-10 rounded-2xl border border-[#EAE2D6] bg-white/80 p-5 sm:p-7 shadow-[0_12px_30px_rgba(44,42,40,0.04)]">
            <div className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
              {intro}
            </div>
          </div>
        )}

        <div className="space-y-8">{children}</div>
      </section>
    </div>
  );
};

export default LegalPage;

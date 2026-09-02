import React from 'react';
import LegalPage from '@/components/organisms/LegalPage';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="1st August 2026"
      intro={
        <>
          Ellestyle India values your privacy and is committed to protecting the personal information you share with us while shopping, contacting us, or using our website.
          <br />
          <br />
          By using our website, you agree to the terms of this Privacy Policy.
        </>
      }
    >
      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">1. Information We Collect</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          We may collect your name, email address, phone number, shipping and billing address, order details, payment-related information, and any messages or inquiries you send to us.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>To process and deliver your orders.</li>
          <li>To communicate with you about your purchase, status updates, or customer support.</li>
          <li>To improve our products, website experience, and customer service.</li>
          <li>To send order-related notifications and occasional updates about new collections or promotions.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">3. Sharing Your Information</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          We do not sell or rent your personal information. We may share it with trusted service providers such as payment gateways, shipping partners, and technical support providers only to the extent necessary to operate our business.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">4. Cookies & Analytics</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          We may use cookies or similar technologies to improve website performance and understand browsing behavior. These tools help us measure engagement and enhance your shopping experience.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">5. Security</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          We take reasonable steps to protect your information using secure systems and processes. However, no internet-based service is completely risk-free, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">6. Your Rights</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          You may contact us at any time to request access, correction, or deletion of your personal information, subject to legal requirements and business needs.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">7. Third-Party Links</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites, and we encourage you to review their privacy policies before submitting information.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">8. Changes to This Policy</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          We may update this Privacy Policy from time to time. Continued use of the website after any changes means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">9. Contact Us</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us at:
          <br />
          📧 ellestyle12220@gmail.com
          <br />
          📱 +91 8619607001
        </p>
      </section>
    </LegalPage>
  );
};

export default PrivacyPolicyPage;

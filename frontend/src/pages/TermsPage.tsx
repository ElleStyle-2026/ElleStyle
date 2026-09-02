import React from 'react';
import LegalPage from '@/components/organisms/LegalPage';

const TermsPage: React.FC = () => {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="1st August 2026"
      intro={
        <>
          Welcome to Ellestyle India (“we,” “us,” “our”). We create and sell handmade bags, Rajasthani patchwork home decor, artisan candles, handmade jewellery, and custom wedding giveaways and favours.
          <br />
          <br />
          By visiting our website, placing an order, or contacting us for a custom order, you agree to the following Terms & Conditions. Please read them carefully.
        </>
      }
    >
      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">1. About Us</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          Ellestyle India is a handmade goods brand based in Rajasthan, India. All products are handcrafted, and each piece may show minor variation in color, texture, size, or pattern — this is a natural feature of handmade work, not a defect.
        </p>
        <p className="mt-4 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          Contact: ellestyle12220@gmail.com | +91 8619607001
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">2. Products & Availability</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>All products are subject to availability. We reserve the right to discontinue any product or limit quantities at any time.</li>
          <li>Because items are handmade, colors, patterns, and finishing may vary slightly from photos shown on the website or social media.</li>
          <li>Product images are for representation purposes. Actual product may vary slightly in shade due to lighting, screen settings, or natural material variation.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">3. Custom Orders & Wedding Giveaways</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Bulk and custom orders require advance booking and typically a non-refundable advance or token payment of 50% to confirm the order.</li>
          <li>Production timelines will be shared at the time of order confirmation and may vary based on order size and season.</li>
          <li>Once production has started on a custom order, cancellation is not possible, and the advance is non-refundable.</li>
          <li>Design or sample approval must be confirmed in writing before mass production begins. We are not responsible for errors in names, dates, or details provided by the customer.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">4. Pricing & Payment</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>All prices are listed in INR (₹) unless stated otherwise, and applicable taxes are as noted on the product page.</li>
          <li>We accept payments via UPI, bank transfer, cards, and other methods as displayed on the checkout page.</li>
          <li>Prices are subject to change without prior notice; the price at the time of order confirmation will apply.</li>
          <li>Orders are confirmed only after successful payment or advance payment for custom orders.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">5. Shipping & Delivery</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Orders are shipped within 3–7 business days of confirmation, excluding custom and bulk orders.</li>
          <li>Delivery timelines are estimates and not guaranteed; we are not liable for delays caused by courier services, weather, strikes, or other events beyond our control.</li>
          <li>Risk of loss or damage passes to the courier once the package is handed over, though we will assist with claims for damaged or lost items.</li>
          <li>Shipping charges, if any, will be shown at checkout.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">6. Returns, Exchange & Refunds</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Because all products are handmade and often made to order, we do not accept returns for change of mind.</li>
          <li>We accept returns or exchange only in case of item received damaged or defective, or wrong item delivered.</li>
          <li>To raise a claim, contact us within 48 hours of delivery with your order number and clear photos or video of the product and packaging.</li>
          <li>Custom, personalized, and wedding giveaway or bulk orders are final sale and not eligible for return, exchange, or refund except in case of a manufacturing defect.</li>
          <li>Candles and jewellery, once used, cannot be returned for hygiene or safety reasons.</li>
          <li>Approved refunds will be processed to the original payment method within 7–10 business days or offered as store credit where applicable.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">7. Product Care & Liability</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Handmade items require gentle care; care instructions will be shared with your order or on the product page.</li>
          <li>Candles should always be burned within sight, away from flammable materials, and according to standard candle safety practices.</li>
          <li>Jewellery should avoid contact with water, perfume, and sweat to preserve finish; we are not liable for tarnishing or damage caused by normal wear or improper storage.</li>
          <li>We are not liable for any indirect, incidental, or consequential damages arising from the use or misuse of our products.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">8. Intellectual Property</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>All designs, patterns, photographs, and content on this website and social media are our property and may not be copied, reproduced, or used commercially without our written permission.</li>
          <li>Customers may not reproduce or resell our designs as their own.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">9. User Conduct</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          You agree not to misuse the website, including attempting unauthorized access, submitting false information, or using the site for any unlawful purpose.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">10. Limitation of Liability</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          To the fullest extent permitted by law, Ellestyle India shall not be liable for any indirect, special, or consequential loss arising from your use of our website or products. Our total liability for any claim shall not exceed the amount paid by you for the relevant order.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">11. Governing Law</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Jaipur, Rajasthan.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">12. Changes to Terms</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          We may update these Terms & Conditions from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.
        </p>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">13. Contact Us</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          For any questions regarding these Terms & Conditions, reach out to us at:
          <br />
          📧 ellestyle12220@gmail.com
          <br />
          📱 +91 8619607001
        </p>
      </section>
    </LegalPage>
  );
};

export default TermsPage;

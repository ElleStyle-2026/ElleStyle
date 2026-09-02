import React from 'react';
import LegalPage from '@/components/organisms/LegalPage';

const ShippingReturnsPage: React.FC = () => {
  return (
    <LegalPage
      title="Shipping, Delivery & Return"
      lastUpdated="1st August 2026"
      intro={
        <>
          We are a small, growing handmade business rooted in Rajasthani craft traditions. We believe in being transparent and kind with our customers as we create thoughtful, handmade pieces for your home, gifting, and everyday life.
          <br />
          <br />
          Why Ellestyle India:
          <br />
          • Handmade, not mass-produced — every piece is crafted by hand
          <br />
          • Rooted in Rajasthani craft traditions — patchwork, embroidery, and textile techniques passed down through generations
          <br />
          • Custom & bulk orders welcome — especially for weddings and events
          <br />
          • Small business, direct from the maker — you are supporting an independent, growing brand
        </>
      }
    >
      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">Trust & Transparency</h2>
        <div className="space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <p><strong className="text-[#2c2a28]">Business Name:</strong> Ellestyle India</p>
          <p><strong className="text-[#2c2a28]">GST Registration No.:</strong> [Insert GSTIN once registered — leave blank until then]</p>
          <p><strong className="text-[#2c2a28]">Location:</strong> Jaipur, Rajasthan</p>
          <p><strong className="text-[#2c2a28]">Contact:</strong> ellestyle12220@gmail.com | +91 8619607001</p>
          <p><strong className="text-[#2c2a28]">Order & Return Policy:</strong> See our Terms & Conditions page for shipping, custom order, and return details.</p>
        </div>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">1. Shipping & Dispatch</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Each product is handcrafted with care, and dispatch timelines may vary depending on the product and order volume.</li>
          <li>Orders are typically dispatched within 3–7 business days of confirmation.</li>
          <li>Custom and bulk orders may require longer timelines and will be communicated separately.</li>
          <li>Delivery times are approximate and depend on courier partner schedules and regional logistics.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">2. Delivery & Risk</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Once the parcel is handed to the courier, the risk of loss or damage is transferred to the courier.</li>
          <li>We help customers with tracking and claim support where possible.</li>
          <li>We are not responsible for delays caused by courier issues, weather, strikes, or other circumstances beyond our control.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">3. Returns, Exchange & Refunds</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Because our products are handmade, we do not accept returns for change of mind.</li>
          <li>Returns or exchanges are accepted only for damaged or defective items or for incorrect deliveries.</li>
          <li>Customers must inform us within 48 hours of delivery with order details and clear photos/video of the item and packaging.</li>
          <li>Custom, personalised, wedding giveaway, and bulk orders are final sale and not eligible for return or exchange, except for manufacturing defects.</li>
          <li>Jewellery and candles, once used, are not eligible for return due to hygiene and safety reasons.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">4. Cancellation Policy</h2>
        <ul className="list-disc pl-5 space-y-3 text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          <li>Custom orders require advance payment and are non-refundable once production starts.</li>
          <li>Ready-to-ship products, if they have not started processing, may be cancelled at our discretion.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-fraunces text-2xl sm:text-3xl text-[#03989E] font-bold mb-5">5. Contact for Support</h2>
        <p className="text-[15px] sm:text-[16px] text-[#59524a] leading-relaxed">
          For shipping, order, or return assistance, please contact us at:
          <br />
          📧 ellestyle12220@gmail.com
          <br />
          📱 +91 8619607001
        </p>
      </section>
    </LegalPage>
  );
};

export default ShippingReturnsPage;

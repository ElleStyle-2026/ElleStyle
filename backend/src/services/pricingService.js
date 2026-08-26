const Product = require('../models/Product');
const couponService = require('./couponService');

class PricingService {
  async calculateOrderTotals(items, couponCode, customerId) {
    // items should be array of { product: productId, quantity }
    if (!items || items.length === 0) {
      throw new Error('No order items');
    }

    const cartItems = items.map(i => ({ 
      productId: i.product || i.productId, 
      quantity: i.quantity,
      sellingMode: i.sellingMode,
      packCount: i.packCount,
      selectedSetOptionId: i.selectedSetOptionId
    }));

    // 1. Validate Coupon & Calculate Authoritative Totals
    let couponResult = null;
    let finalPricing = null;
    let appliedCouponId = null;
    let appliedDiscountAmount = 0;

    if (couponCode) {
      couponResult = await couponService.validateAndCalculate(couponCode, cartItems, customerId);
      if (!couponResult.valid) {
        throw new Error(couponResult.message);
      }
      finalPricing = couponResult.pricing;
      appliedCouponId = couponResult.coupon._id;
      appliedDiscountAmount = finalPricing.discount;
    }

    // 2. Fetch products and calculate fallback subtotal
    const orderItems = [];
    let fallbackSubtotal = 0;
    const { resolveLinePrice } = require('../utils/pricingLogic');

    for (const item of items) {
      const product = await Product.findById(item.product || item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.product || item.productId}`);
      }
      
      const resolution = resolveLinePrice(product, item);
      if (!resolution.isValid) {
        throw new Error(`Invalid item: ${product.name} - ${resolution.error}`);
      }

      const { cartFields } = resolution;
      
      if (product.stock < cartFields.physicalQuantity && product.availability !== 'Pre-Order') {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      // Fallback calculation uses the resolved authoritative cart fields
      // For sets, quantity is packCount and price is pricePerSet
      const itemTotal = cartFields.price * cartFields.quantity;
      fallbackSubtotal += itemTotal;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        price: cartFields.price,
        quantity: cartFields.quantity,
        image: product.images?.[0]?.secure_url || '',
        ...cartFields // Inject sellingMode, packCount, etc. into order snapshot
      });
    }

    // 3. Finalize Pricing
    let subtotal = fallbackSubtotal;
    let discount = 0;
    let shipping = 0; // Default shipping
    let tax = 0;
    let grandTotal = subtotal + shipping + tax;

    if (finalPricing) {
      subtotal = finalPricing.subtotal;
      discount = finalPricing.discount;
      shipping = finalPricing.shippingDiscount === -1 ? 0 : finalPricing.shipping;
      tax = finalPricing.tax;
      grandTotal = finalPricing.grandTotal;
    }

    return {
      orderItems,
      subtotal,
      discount,
      shipping,
      tax,
      grandTotal,
      appliedCouponId,
      appliedDiscountAmount
    };
  }
}

module.exports = new PricingService();

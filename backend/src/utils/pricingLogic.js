const mongoose = require('mongoose');

/**
 * Resolves authoritative pricing and validates quantities based on the product's selling mode.
 * 
 * @param {Object} product - The fetched Product document
 * @param {Object} requestedData - The data requested by the client
 * @param {Number} requestedData.quantity - Generic quantity (for standard/moq)
 * @param {Number} requestedData.packCount - Number of sets requested (for set mode)
 * @param {String} requestedData.selectedSetOptionId - The ID of the selected set option (for set mode)
 * @returns {Object} { isValid, error, cartFields }
 */
const resolveLinePrice = (product, requestedData) => {
  const mode = product.sellingMode || 'standard';

  if (mode === 'standard') {
    const qty = parseInt(requestedData.quantity, 10);
    if (!qty || qty < 1) {
      return { isValid: false, error: 'Invalid quantity' };
    }

    return {
      isValid: true,
      cartFields: {
        sellingMode: 'standard',
        quantity: qty,
        price: product.price, // Unit price
      }
    };
  }

  if (mode === 'set') {
    const packCount = parseInt(requestedData.packCount || requestedData.quantity, 10);
    const setId = requestedData.selectedSetOptionId;

    if (!packCount || packCount < 1) {
      return { isValid: false, error: 'Invalid pack count' };
    }
    if (!setId) {
      return { isValid: false, error: 'Set option ID is required for this product' };
    }

    const setOption = product.setOptions?.find(
      (opt) => String(opt._id) === String(setId) && opt.isActive
    );

    if (!setOption) {
      return { isValid: false, error: 'Selected set option is invalid or inactive' };
    }

    const physicalQuantity = packCount * setOption.quantity;

    // We store the total price of the set in pricePerSet, and since the cart system
    // typically multiplies `price * quantity` to get total, we need to be careful.
    // If cart logic does `item.price * item.quantity` and quantity = physicalQuantity,
    // then price should be (pricePerSet / itemsPerSet). 
    // BUT since it's fixed pricing, we can just set `quantity: packCount` and `price: pricePerSet`
    // so `price * quantity` naturally yields `pricePerSet * packCount`.
    // We will store physicalQuantity separately so inventory checks can use it.
    
    return {
      isValid: true,
      cartFields: {
        sellingMode: 'set',
        quantity: packCount, // Treat 'quantity' field as packCount so cart totals work seamlessly (price * packCount)
        price: setOption.price, // Price per set
        selectedSetOptionId: setOption._id,
        itemsPerSet: setOption.quantity,
        packCount: packCount,
        physicalQuantity: physicalQuantity,
        pricePerSet: setOption.price,
      }
    };
  }

  if (mode === 'moq') {
    const qty = parseInt(requestedData.quantity, 10);
    if (!qty) {
      return { isValid: false, error: 'Invalid quantity' };
    }

    const moqConfig = product.moqConfig;
    if (!moqConfig) {
      return { isValid: false, error: 'MOQ configuration missing on product' };
    }

    const minQty = moqConfig.minimumQuantity || 1;
    const maxQty = moqConfig.maximumQuantity;

    if (qty < minQty) {
      return { isValid: false, error: `Minimum order quantity is ${minQty}` };
    }

    if (maxQty && qty > maxQty) {
      return { isValid: false, error: `Maximum order quantity is ${maxQty}` };
    }

    const basePrice = moqConfig.basePrice || 0;
    const additionalPrice = moqConfig.additionalUnitPrice || 0;

    // Total price = basePrice + ((qty - minQty) * additionalPrice)
    const totalPrice = basePrice + ((qty - minQty) * additionalPrice);
    
    // Calculate effective unit price so cart calculations (price * quantity) match exactly
    const effectiveUnitPrice = totalPrice / qty;

    return {
      isValid: true,
      cartFields: {
        sellingMode: 'moq',
        quantity: qty,
        price: effectiveUnitPrice,
        minimumQuantityAtPurchase: minQty,
        baseMOQPriceAtPurchase: basePrice,
        additionalUnitPriceAtPurchase: additionalPrice
      }
    };
  }

  return { isValid: false, error: 'Unknown selling mode' };
};

module.exports = {
  resolveLinePrice
};

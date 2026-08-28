const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { resolveLinePrice } = require('../utils/pricingLogic');

// Helper function to create a unique cache/merge key for cart items
const getCartItemKey = (item) => {
  const pId = String(item.product._id || item.product);
  if (item.sellingMode === 'set' && item.selectedSetOptionId) {
    return `${pId}_set_${String(item.selectedSetOptionId)}`;
  }
  return pId;
};

// Helper function to deduplicate items in a cart document
const deduplicateCart = async (cart) => {
  if (!cart || !cart.items || cart.items.length <= 1) return cart;
  
  let hasDuplicates = false;
  const uniqueItemsMap = {};
  
  for (const item of cart.items) {
    if (!item.product || !mongoose.Types.ObjectId.isValid(String(item.product._id || item.product))) {
      hasDuplicates = true; // Flag to filter out null or invalid product references
      continue;
    }
    
    const key = getCartItemKey(item);
    
    if (uniqueItemsMap[key]) {
      // If it's a set, packCount is equivalent to quantity
      if (item.sellingMode === 'set') {
        uniqueItemsMap[key].packCount = (uniqueItemsMap[key].packCount || 1) + (item.packCount || 1);
        uniqueItemsMap[key].quantity = uniqueItemsMap[key].packCount; // generic sync
        uniqueItemsMap[key].physicalQuantity = uniqueItemsMap[key].packCount * (item.itemsPerSet || 1);
      } else {
        uniqueItemsMap[key].quantity += (item.quantity || 1);
      }
      hasDuplicates = true;
    } else {
      uniqueItemsMap[key] = {
        product: item.product,
        quantity: item.quantity || 1,
        price: item.price || 0,
        sellingMode: item.sellingMode || 'standard',
        selectedSetOptionId: item.selectedSetOptionId,
        itemsPerSet: item.itemsPerSet,
        packCount: item.packCount,
        physicalQuantity: item.physicalQuantity,
        pricePerSet: item.pricePerSet,
        minimumQuantityAtPurchase: item.minimumQuantityAtPurchase,
        baseMOQPriceAtPurchase: item.baseMOQPriceAtPurchase,
        additionalUnitPriceAtPurchase: item.additionalUnitPriceAtPurchase
      };
    }
  }

  if (hasDuplicates) {
    cart.items = Object.values(uniqueItemsMap);
    await cart.save();
  }
  return cart;
};


// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart = await deduplicateCart(cart);
    }

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug sellingMode setOptions moqConfig stock availability'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, packCount, selectedSetOptionId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const resolution = resolveLinePrice(product, { quantity, packCount, selectedSetOptionId });
    if (!resolution.isValid) {
      return res.status(400).json({ success: false, message: resolution.error });
    }

    const { cartFields } = resolution;

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      try {
        cart = await Cart.create({
          user: req.user._id,
          items: [{ product: productId, ...cartFields }]
        });
      } catch (createErr) {
        if (createErr.code === 11000) {
          cart = await Cart.findOne({ user: req.user._id });
        } else {
          throw createErr;
        }
      }
    }

    if (cart) {
      // Find if an identical item already exists (matching productId and set ID if applicable)
      const itemKey = getCartItemKey({ product: productId, ...cartFields });
      const itemIndex = cart.items.findIndex(item => getCartItemKey(item) === itemKey);

      if (itemIndex > -1) {
        if (cartFields.sellingMode === 'set') {
          cart.items[itemIndex].packCount += cartFields.packCount;
          cart.items[itemIndex].quantity = cart.items[itemIndex].packCount;
          cart.items[itemIndex].physicalQuantity += cartFields.physicalQuantity;
        } else {
          cart.items[itemIndex].quantity += cartFields.quantity;
          
          // Re-evaluate MOQ pricing after quantity change
          if (cartFields.sellingMode === 'moq') {
             const newRes = resolveLinePrice(product, { quantity: cart.items[itemIndex].quantity });
             if (newRes.isValid) {
               cart.items[itemIndex].price = newRes.cartFields.price;
             }
          }
        }
      } else {
        cart.items.push({ product: productId, ...cartFields });
      }
      
      await cart.save();
    }

    cart = await deduplicateCart(cart);

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug sellingMode setOptions moqConfig stock availability'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:cartItemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { cartItemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => String(item.product._id || item.product) === cartItemId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const item = cart.items[itemIndex];
        const product = item.product;
        
        // Re-resolve pricing based on new quantity
        const requestData = { quantity };
        if (item.sellingMode === 'set') {
           requestData.packCount = quantity;
           requestData.selectedSetOptionId = item.selectedSetOptionId;
        }

        const resolution = resolveLinePrice(product, requestData);
        if (!resolution.isValid) {
          return res.status(400).json({ success: false, message: resolution.error });
        }

        Object.assign(cart.items[itemIndex], resolution.cartFields);
      }
      await cart.save();
    } else {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Re-populate to get standard format
    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug sellingMode setOptions moqConfig stock availability'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:cartItemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => String(item.product._id || item.product) !== cartItemId);
    await cart.save();

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug sellingMode setOptions moqConfig stock availability'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Merge local cart with DB cart on login
// @route   POST /api/cart/merge
// @access  Private
exports.mergeCart = async (req, res) => {
  try {
    const { localItems } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart = await deduplicateCart(cart);
    }

    if (localItems && Array.isArray(localItems) && localItems.length > 0) {
      for (const item of localItems) {
        const idStr = String(item.id || item.productId || '');
        if (!idStr || !mongoose.Types.ObjectId.isValid(idStr)) {
          continue;
        }

        const dbProduct = await Product.findById(idStr);
        if (!dbProduct) continue;

        const resolution = resolveLinePrice(dbProduct, { 
          quantity: item.quantity, 
          packCount: item.packCount, 
          selectedSetOptionId: item.selectedSetOptionId 
        });

        if (resolution.isValid) {
           const itemKey = getCartItemKey({ product: idStr, ...resolution.cartFields });
           const itemIndex = cart.items.findIndex(ci => ci && ci.product && getCartItemKey(ci) === itemKey);
           
           if (itemIndex > -1) {
             if (resolution.cartFields.sellingMode === 'set') {
               cart.items[itemIndex].packCount += resolution.cartFields.packCount;
               cart.items[itemIndex].quantity = cart.items[itemIndex].packCount;
               cart.items[itemIndex].physicalQuantity += resolution.cartFields.physicalQuantity;
             } else {
               cart.items[itemIndex].quantity += resolution.cartFields.quantity;
               // re-resolve moq
               if (resolution.cartFields.sellingMode === 'moq') {
                 const newRes = resolveLinePrice(dbProduct, { quantity: cart.items[itemIndex].quantity });
                 if (newRes.isValid) cart.items[itemIndex].price = newRes.cartFields.price;
               }
             }
           } else {
             cart.items.push({ product: idStr, ...resolution.cartFields });
           }
        }
      }
      await cart.save();
    }
    
    cart = await deduplicateCart(cart);

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug sellingMode setOptions moqConfig stock availability'
    });

    if (cart && cart.items && cart.items.some(i => !i.product)) {
      cart.items = cart.items.filter(i => i.product);
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error('Cart merge error:', err);
    res.status(500).json({ success: false, message: 'Server Error during cart merge' });
  }
};

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  sellingMode: {
    type: String,
    enum: ['standard', 'set', 'moq'],
    default: 'standard'
  },
  selectedSetOptionId: { type: mongoose.Schema.Types.ObjectId },
  itemsPerSet: { type: Number },
  packCount: { type: Number },
  physicalQuantity: { type: Number },
  pricePerSet: { type: Number },
  minimumQuantityAtPurchase: { type: Number },
  baseMOQPriceAtPurchase: { type: Number },
  additionalUnitPriceAtPurchase: { type: Number }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // A user can only have one active cart
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Cart', cartSchema);

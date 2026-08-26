const mongoose = require('mongoose');

const testimonialShowcaseSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      // Optional, since admin can create manual showcases without a linked review
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerProfileImage: {
      type: String,
      // We can store the generated UI Avatar or real image URL here
    },
    mediaUrl: {
      type: String,
      required: [true, 'Media URL is required'],
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Media type (image or video) is required'],
    },
    badgeText: {
      type: String,
      trim: true,
      default: '', // e.g., 'HANDMADE EARRINGS'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TestimonialShowcase = mongoose.model('TestimonialShowcase', testimonialShowcaseSchema);

module.exports = TestimonialShowcase;

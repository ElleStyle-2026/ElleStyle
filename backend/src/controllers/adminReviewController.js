const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/v1/admin/reviews
// @access  Private/Admin
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name')
      .sort('-createdAt');
    
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a review (Admin bypasses user auth)
// @route   POST /api/v1/admin/reviews
// @access  Private/Admin
exports.createReview = async (req, res) => {
  try {
    const { product, customerName, customerEmail, rating, comment, status, media, isVerifiedPurchase } = req.body;
    
    // Admin creates a review. We still need a user ref. We can use the admin's own ID or create a dummy user logic,
    // but schema requires `user`. So we'll pass req.user._id as the creator (admin).
    const review = await Review.create({
      product,
      user: req.user._id, // Assigning to the admin user who created it
      customerName,
      customerEmail,
      rating,
      comment,
      status: status || 'approved',
      media: media || [],
      isVerifiedPurchase: isVerifiedPurchase || true
    });
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review status or highlight
// @route   PUT /api/v1/admin/reviews/:id/status
// @access  Private/Admin
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status, isHighlighted } = req.body; 
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isHighlighted !== undefined) updateData.isHighlighted = isHighlighted;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, message: `Review updated`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

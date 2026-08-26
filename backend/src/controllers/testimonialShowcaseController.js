const TestimonialShowcase = require('../models/TestimonialShowcase');

// Get all active showcases (for public homepage)
exports.getActiveShowcases = async (req, res) => {
  try {
    const showcases = await TestimonialShowcase.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(8);
    res.status(200).json({ success: true, data: showcases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all showcases (for admin panel)
exports.getAllShowcases = async (req, res) => {
  try {
    const showcases = await TestimonialShowcase.find()
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: showcases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a showcase (manual creation by admin or promote from review)
exports.createShowcase = async (req, res) => {
  try {
    const { review, customerName, customerProfileImage, mediaUrl, mediaType, badgeText, isActive, order } = req.body;
    
    const newShowcase = await TestimonialShowcase.create({
      review,
      customerName,
      customerProfileImage: customerProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random`,
      mediaUrl,
      mediaType,
      badgeText,
      isActive,
      order,
    });
    
    res.status(201).json({ success: true, data: newShowcase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a showcase
exports.updateShowcase = async (req, res) => {
  try {
    const showcase = await TestimonialShowcase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!showcase) {
      return res.status(404).json({ success: false, message: 'Showcase not found' });
    }
    
    res.status(200).json({ success: true, data: showcase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a showcase
exports.deleteShowcase = async (req, res) => {
  try {
    const showcase = await TestimonialShowcase.findByIdAndDelete(req.params.id);
    
    if (!showcase) {
      return res.status(404).json({ success: false, message: 'Showcase not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

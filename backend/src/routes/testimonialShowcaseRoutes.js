const express = require('express');
const router = express.Router();
const {
  getActiveShowcases,
  getAllShowcases,
  createShowcase,
  updateShowcase,
  deleteShowcase,
} = require('../controllers/testimonialShowcaseController');

// Public route to get active showcases for the homepage
router.get('/public', getActiveShowcases);
// Alias for root public
router.get('/', getActiveShowcases);

module.exports = router;

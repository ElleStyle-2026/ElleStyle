const express = require('express');
const router = express.Router();
const {
  getAllShowcases,
  createShowcase,
  updateShowcase,
  deleteShowcase,
  reorderShowcases,
} = require('../controllers/testimonialShowcaseController');

router.route('/')
  .get(getAllShowcases)
  .post(createShowcase);

router.post('/reorder', reorderShowcases);

router.route('/:id')
  .put(updateShowcase)
  .delete(deleteShowcase);

module.exports = router;

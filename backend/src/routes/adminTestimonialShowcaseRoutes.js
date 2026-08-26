const express = require('express');
const router = express.Router();
const {
  getAllShowcases,
  createShowcase,
  updateShowcase,
  deleteShowcase,
} = require('../controllers/testimonialShowcaseController');

router.route('/')
  .get(getAllShowcases)
  .post(createShowcase);

router.route('/:id')
  .put(updateShowcase)
  .delete(deleteShowcase);

module.exports = router;

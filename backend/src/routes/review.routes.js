const express = require('express');
const { getPendingReviews, getApprovedReviews, getRejectedReviews, approveReview, rejectReview, submitCorrection } = require('../controllers/review.controller');

const router = express.Router();

router.get('/pending', getPendingReviews);
router.get('/approved', getApprovedReviews);
router.get('/rejected', getRejectedReviews);
router.post('/:reviewId/approve', approveReview);
router.post('/:reviewId/reject', rejectReview);
router.post('/:reviewId/correct', submitCorrection);

module.exports = router;

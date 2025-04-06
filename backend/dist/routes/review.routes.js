"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/reviews
router.post('/', auth_middleware_1.authenticate, review_controller_1.createReview);
// GET /api/reviews/doctor/:doctorId
router.get('/doctor/:doctorId', review_controller_1.getDoctorReviews);
// GET /api/reviews/:id
router.get('/:id', review_controller_1.getReviewById);
// PUT /api/reviews/:id
router.put('/:id', auth_middleware_1.authenticate, review_controller_1.updateReview);
// DELETE /api/reviews/:id
router.delete('/:id', auth_middleware_1.authenticate, review_controller_1.deleteReview);
exports.default = router;

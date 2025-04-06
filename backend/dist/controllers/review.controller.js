"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getDoctorReviews = exports.createReview = void 0;
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const prisma = new client_1.PrismaClient();
const createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        const patientId = req.user?.id;
        if (!patientId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Validate rating
        if (rating < 1 || rating > 5) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Rating must be between 1 and 5');
        }
        // Check if appointment exists and belongs to the patient
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(appointmentId) }
        });
        if (!appointment) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Appointment not found');
        }
        if (appointment.patientId !== patientId) {
            return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
        }
        // Check if appointment is completed
        if (appointment.status !== 'COMPLETED') {
            return (0, responseHandler_1.sendResponse)(res, 400, 'You can only review completed appointments');
        }
        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
            where: { appointmentId: appointment.id }
        });
        if (existingReview) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Review already exists for this appointment');
        }
        // Create review
        const review = await prisma.review.create({
            data: {
                patientId,
                doctorId: appointment.doctorId,
                appointmentId: appointment.id,
                rating,
                comment
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                appointment: {
                    select: {
                        id: true,
                        date: true
                    }
                }
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 201, 'Review created', review);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.createReview = createReview;
const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { doctorId: parseInt(doctorId) },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                appointment: {
                    select: {
                        id: true,
                        date: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Doctor reviews retrieved', reviews);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getDoctorReviews = getDoctorReviews;
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await prisma.review.findUnique({
            where: { id: parseInt(id) },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                appointment: {
                    select: {
                        id: true,
                        date: true
                    }
                }
            }
        });
        if (!review) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Review not found');
        }
        return (0, responseHandler_1.sendResponse)(res, 200, 'Review retrieved', review);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getReviewById = getReviewById;
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const patientId = req.user?.id;
        if (!patientId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Validate rating
        if (rating && (rating < 1 || rating > 5)) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Rating must be between 1 and 5');
        }
        // Check if review exists and belongs to the patient
        const review = await prisma.review.findUnique({
            where: { id: parseInt(id) }
        });
        if (!review) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Review not found');
        }
        if (review.patientId !== patientId) {
            return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your review');
        }
        // Update review
        const updatedReview = await prisma.review.update({
            where: { id: parseInt(id) },
            data: {
                rating,
                comment
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                appointment: {
                    select: {
                        id: true,
                        date: true
                    }
                }
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Review updated', updatedReview);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const patientId = req.user?.id;
        if (!patientId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Check if review exists and belongs to the patient
        const review = await prisma.review.findUnique({
            where: { id: parseInt(id) }
        });
        if (!review) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Review not found');
        }
        if (review.patientId !== patientId) {
            return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your review');
        }
        // Delete review
        await prisma.review.delete({
            where: { id: parseInt(id) }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Review deleted');
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.deleteReview = deleteReview;

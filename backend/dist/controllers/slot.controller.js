"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSlot = exports.updateSlot = exports.getDoctorSlots = exports.getAvailableSlots = exports.createSlot = void 0;
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const prisma = new client_1.PrismaClient();
const createSlot = async (req, res) => {
    try {
        const { startTime, endTime, maxPatients } = req.body;
        const doctorId = req.user?.id;
        if (!doctorId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Validate doctor
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId }
        });
        if (!doctor) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Doctor not found');
        }
        // Validate time
        if (new Date(startTime) >= new Date(endTime)) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'End time must be after start time');
        }
        // Check for overlapping slots
        const overlappingSlots = await prisma.slot.findMany({
            where: {
                doctorId,
                OR: [
                    {
                        startTime: { lt: new Date(endTime) },
                        endTime: { gt: new Date(startTime) }
                    }
                ]
            }
        });
        if (overlappingSlots.length > 0) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Slot overlaps with existing slots');
        }
        // Create slot
        const slot = await prisma.slot.create({
            data: {
                doctorId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                maxPatients: maxPatients || 1
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 201, 'Slot created', slot);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.createSlot = createSlot;
const getAvailableSlots = async (req, res) => {
    try {
        const { date, specialty } = req.query;
        let whereClause = {
            isAvailable: true,
            startTime: {
                gte: new Date()
            }
        };
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            whereClause.startTime = {
                gte: startDate,
                lte: endDate
            };
        }
        if (specialty) {
            whereClause.doctor = {
                specialty: specialty
            };
        }
        const slots = await prisma.slot.findMany({
            where: whereClause,
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialty: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Available slots retrieved', slots);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getAvailableSlots = getAvailableSlots;
const getDoctorSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { availableOnly } = req.query;
        let whereClause = {
            doctorId: parseInt(doctorId)
        };
        if (availableOnly === 'true') {
            whereClause.isAvailable = true;
            whereClause.startTime = {
                gte: new Date()
            };
        }
        const slots = await prisma.slot.findMany({
            where: whereClause,
            orderBy: {
                startTime: 'asc'
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Doctor slots retrieved', slots);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getDoctorSlots = getDoctorSlots;
const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, maxPatients, isAvailable } = req.body;
        const doctorId = req.user?.id;
        if (!doctorId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Check if slot exists and belongs to the doctor
        const slot = await prisma.slot.findUnique({
            where: { id: parseInt(id) }
        });
        if (!slot) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Slot not found');
        }
        if (slot.doctorId !== doctorId) {
            return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your slot');
        }
        // Check if slot has appointments
        const appointments = await prisma.appointment.count({
            where: {
                slotId: slot.id,
                status: 'SCHEDULED'
            }
        });
        if (appointments > 0 && (startTime || endTime)) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Cannot change time of slot with scheduled appointments');
        }
        // Update slot
        const updatedSlot = await prisma.slot.update({
            where: { id: parseInt(id) },
            data: {
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                maxPatients,
                isAvailable
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Slot updated', updatedSlot);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.updateSlot = updateSlot;
const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user?.id;
        if (!doctorId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Check if slot exists and belongs to the doctor
        const slot = await prisma.slot.findUnique({
            where: { id: parseInt(id) }
        });
        if (!slot) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Slot not found');
        }
        if (slot.doctorId !== doctorId) {
            return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your slot');
        }
        // Check if slot has appointments
        const appointments = await prisma.appointment.count({
            where: { slotId: slot.id }
        });
        if (appointments > 0) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Cannot delete slot with appointments');
        }
        // Delete slot
        await prisma.slot.delete({
            where: { id: parseInt(id) }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Slot deleted');
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.deleteSlot = deleteSlot;

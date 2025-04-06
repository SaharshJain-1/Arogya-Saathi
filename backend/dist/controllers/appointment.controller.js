"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPrescription = exports.deleteAppointment = exports.updateAppointment = exports.getAppointmentById = exports.getAppointments = exports.createAppointment = void 0;
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const prisma = new client_1.PrismaClient();
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "SCHEDULED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
})(AppointmentStatus || (AppointmentStatus = {}));
const createAppointment = async (req, res) => {
    try {
        const { slotId } = req.body;
        const patientId = req.user?.id;
        if (!patientId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        if (!slotId || isNaN(Number(slotId))) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Valid slotId is required');
        }
        // Check if slot exists and is available
        const slot = await prisma.slot.findUnique({
            where: { id: parseInt(slotId) },
            include: { doctor: true }
        });
        if (!slot) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Slot not found');
        }
        if (!slot.isAvailable) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Slot is not available');
        }
        if (slot.bookedPatients >= slot.maxPatients) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Slot is fully booked');
        }
        // Check if patient already has an appointment at this time
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                patientId,
                slot: {
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }
            }
        });
        if (existingAppointment) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'You already have an appointment at this time');
        }
        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId: slot.doctorId,
                slotId: slot.id,
                date: slot.startTime,
                status: 'SCHEDULED'
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialty: true
                    }
                },
                slot: {
                    select: {
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });
        // Update slot booked patients count
        await prisma.slot.update({
            where: { id: slot.id },
            data: {
                bookedPatients: {
                    increment: 1
                },
                isAvailable: slot.maxPatients > slot.bookedPatients + 1
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 201, 'Appointment created', appointment);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.createAppointment = createAppointment;
const getAppointments = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        let appointments;
        if (req.user && 'medicalLicense' in req.user) {
            // Doctor view
            appointments = await prisma.appointment.findMany({
                where: { doctorId: userId },
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    slot: {
                        select: {
                            startTime: true,
                            endTime: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });
        }
        else if (req.user && 'dob' in req.user) {
            // Patient view
            appointments = await prisma.appointment.findMany({
                where: { patientId: userId },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            specialty: true
                        }
                    },
                    slot: {
                        select: {
                            startTime: true,
                            endTime: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });
        }
        else {
            // Admin view - all appointments
            appointments = await prisma.appointment.findMany({
                include: {
                    doctor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            specialty: true
                        }
                    },
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    slot: {
                        select: {
                            startTime: true,
                            endTime: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });
        }
        return (0, responseHandler_1.sendResponse)(res, 200, 'Appointments retrieved', appointments);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getAppointments = getAppointments;
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(id) },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialty: true
                    }
                },
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                slot: {
                    select: {
                        startTime: true,
                        endTime: true
                    }
                },
                review: true
            }
        });
        if (!appointment) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Appointment not found');
        }
        // Check if user is authorized to view this appointment
        if (req.user && 'medicalLicense' in req.user) {
            if (appointment.doctorId !== userId) {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
            }
        }
        else if (req.user && 'dob' in req.user) {
            if (appointment.patientId !== userId) {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
            }
        }
        // Admin can view all appointments
        return (0, responseHandler_1.sendResponse)(res, 200, 'Appointment retrieved', appointment);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getAppointmentById = getAppointmentById;
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        // Validate status
        if (!Object.values(AppointmentStatus).includes(status)) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Invalid status');
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(id) }
        });
        if (!appointment) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Appointment not found');
        }
        // Check permissions
        if (req.user && 'medicalLicense' in req.user) {
            // Doctor can only update their own appointments
            if (appointment.doctorId !== userId) {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
            }
        }
        else if (req.user && 'dob' in req.user) {
            // Patient can only update their own appointments
            if (appointment.patientId !== userId) {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
            }
            // Patients can only cancel appointments
            if (status !== 'CANCELLED') {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Patients can only cancel appointments');
            }
        }
        // Admin can update any appointment
        const updatedAppointment = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialty: true
                    }
                },
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                slot: {
                    select: {
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });
        // If appointment is cancelled, update slot availability
        if (status === 'CANCELLED') {
            await prisma.slot.update({
                where: { id: appointment.slotId },
                data: {
                    bookedPatients: {
                        decrement: 1
                    },
                    isAvailable: true
                }
            });
        }
        return (0, responseHandler_1.sendResponse)(res, 200, 'Appointment updated', updatedAppointment);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(id) }
        });
        if (!appointment) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'Appointment not found');
        }
        // Check permissions
        if (req.user && 'medicalLicense' in req.user) {
            // Doctor can only delete their own appointments
            if (appointment.doctorId !== userId) {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
            }
        }
        else if (req.user && 'dob' in req.user) {
            // Patient can only delete their own appointments
            if (appointment.patientId !== userId) {
                return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Not your appointment');
            }
        }
        // Admin can delete any appointment
        // Update slot availability
        await prisma.slot.update({
            where: { id: appointment.slotId },
            data: {
                bookedPatients: {
                    decrement: 1
                },
                isAvailable: true
            }
        });
        // Delete appointment
        await prisma.appointment.delete({
            where: { id: parseInt(id) }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Appointment deleted');
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.deleteAppointment = deleteAppointment;
const addPrescription = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.id, 10);
        const userId = req.user?.id;
        if (!userId) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        const { title, notes, tests, medications } = req.body;
        // Check if appointment exists
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                doctor: true,
                patient: true,
                prescription: true,
            },
        });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        const prescription = await prisma.prescription.create({
            data: {
                appointmentId: appointment.id,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                medications,
                notes,
                title,
                tests,
            },
        });
        res.status(201).json(prescription);
    }
    catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addPrescription = addPrescription;

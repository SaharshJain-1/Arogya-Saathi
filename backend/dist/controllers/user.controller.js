"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.getAllPatients = exports.getAllDoctors = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const prisma = new client_1.PrismaClient();
const getAllUsers = async (req, res) => {
    try {
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                specialty: true,
                medicalLicense: true
            }
        });
        const patients = await prisma.patient.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                dob: true
            }
        });
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Users retrieved', {
            doctors,
            patients,
            admins
        });
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getAllUsers = getAllUsers;
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                specialty: true,
                medicalLicense: true
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Doctors retrieved', doctors);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getAllDoctors = getAllDoctors;
const getAllPatients = async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                dob: true
            }
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Patients retrieved', patients);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getAllPatients = getAllPatients;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check all user types
        let user = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                specialty: true,
                medicalLicense: true
            }
        });
        if (!user) {
            user = await prisma.patient.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    dob: true
                }
            });
        }
        if (!user) {
            user = await prisma.admin.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            });
        }
        if (!user) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'User not found');
        }
        return (0, responseHandler_1.sendResponse)(res, 200, 'User retrieved', user);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, specialty, dob, mdeicalHistory, gender } = req.body;
        // Check if user exists and determine type
        let user = await prisma.doctor.findUnique({ where: { id: parseInt(id) } }) ||
            await prisma.patient.findUnique({ where: { id: parseInt(id) } }) ||
            await prisma.admin.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return (0, responseHandler_1.sendResponse)(res, 404, 'User not found');
        }
        let updatedUser;
        if ('medicalLicense' in user) {
            // Doctor
            updatedUser = await prisma.doctor.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    email,
                    specialty,
                    gender,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    specialty: true,
                    gender: true,
                }
            });
        }
        else if ('dob' in user) {
            // Patient
            updatedUser = await prisma.patient.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    email,
                    dob: dob ? new Date(dob) : undefined,
                    gender,
                    mdeicalHistory,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    dob: true,
                    gender: true,
                    mdeicalHistory: true,
                }
            });
        }
        else {
            // Admin
            updatedUser = await prisma.admin.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    email
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            });
        }
        return (0, responseHandler_1.sendResponse)(res, 200, 'User updated', updatedUser);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.updateUser = updateUser;

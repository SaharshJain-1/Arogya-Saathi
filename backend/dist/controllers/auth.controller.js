"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password validation (minimum 8 chars, at least one letter and one number)
const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, specialty, medicalLicense, dob, gender } = req.body;
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !role) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'All fields are required');
        }
        // Validate email format
        if (!emailRegex.test(email)) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Invalid email format');
        }
        // Validate password strength
        if (!passwordRegex.test(password)) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Password must be at least 8 characters long and contain at least one letter and one number');
        }
        // Check if user already exists
        const existingUser = await prisma.doctor.findUnique({ where: { email } }) ||
            await prisma.patient.findUnique({ where: { email } }) ||
            await prisma.admin.findUnique({ where: { email } });
        if (existingUser) {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Email already in use');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12); // Increased salt rounds for better security
        let user;
        if (role === 'DOCTOR') {
            if (!specialty || !medicalLicense) {
                return (0, responseHandler_1.sendResponse)(res, 400, 'Specialty and medical license are required for doctors');
            }
            user = await prisma.doctor.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    specialty,
                    medicalLicense,
                    gender,
                }
            });
        }
        else if (role === 'PATIENT') {
            // Validate date format if dob is provided
            if (dob && isNaN(Date.parse(dob))) {
                return (0, responseHandler_1.sendResponse)(res, 400, 'Invalid date format for date of birth');
            }
            user = await prisma.patient.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    dob: dob ? new Date(dob) : null,
                    gender,
                }
            });
        }
        else if (role === 'ADMIN') {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Admin registration is not allowed');
        }
        else {
            return (0, responseHandler_1.sendResponse)(res, 400, 'Invalid role');
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        return (0, responseHandler_1.sendResponse)(res, 201, 'Registration successful', {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        // Check in all user types
        let user = await prisma.doctor.findUnique({ where: { email } }) ||
            await prisma.patient.findUnique({ where: { email } }) ||
            await prisma.admin.findUnique({ where: { email } });
        if (!user) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Invalid credentials');
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Invalid credentials');
        }
        // Determine role
        let role = '';
        if ('medicalLicense' in user) {
            role = 'DOCTOR';
        }
        else if ('dob' in user) {
            role = 'PATIENT';
        }
        else {
            role = 'ADMIN';
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        return (0, responseHandler_1.sendResponse)(res, 200, 'Login successful', {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role
        });
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return (0, responseHandler_1.sendResponse)(res, 200, 'Logout successful');
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.logout = logout;
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Not authenticated');
        }
        let role = '';
        if ('medicalLicense' in req.user) {
            role = 'DOCTOR';
        }
        else if ('dob' in req.user) {
            role = 'PATIENT';
        }
        else {
            role = 'ADMIN';
        }
        return (0, responseHandler_1.sendResponse)(res, 200, 'User retrieved', {
            ...req.user,
            password: undefined,
            role
        });
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.sendResponse)(res, 500, 'Internal server error');
    }
};
exports.getCurrentUser = getCurrentUser;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        let user;
        if (decoded.role === 'DOCTOR') {
            user = await prisma.doctor.findUnique({ where: { id: decoded.id } });
        }
        else if (decoded.role === 'PATIENT') {
            user = await prisma.patient.findUnique({ where: { id: decoded.id } });
        }
        else if (decoded.role === 'ADMIN') {
            user = await prisma.admin.findUnique({ where: { id: decoded.id } });
        }
        if (!user) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        return (0, responseHandler_1.sendResponse)(res, 401, 'Invalid token');
    }
};
exports.authenticate = authenticate;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, responseHandler_1.sendResponse)(res, 401, 'Authentication required');
        }
        let userRole = '';
        if ('medicalLicense' in req.user) {
            userRole = 'DOCTOR';
        }
        else if ('dob' in req.user) {
            userRole = 'PATIENT';
        }
        else {
            userRole = 'ADMIN';
        }
        if (!roles.includes(userRole)) {
            return (0, responseHandler_1.sendResponse)(res, 403, 'Forbidden - Insufficient permissions');
        }
        next();
    };
};
exports.requireRole = requireRole;

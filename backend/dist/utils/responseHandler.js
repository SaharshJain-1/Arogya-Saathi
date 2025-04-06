"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, message, data) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        statusCode,
    };
    if (message)
        response.message = message;
    if (data)
        response.data = data;
    res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const slot_routes_1 = __importDefault(require("./routes/slot.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const errorHandler_1 = __importDefault(require("./utils/errorHandler"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/slots', slot_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
// Error handling
app.use(errorHandler_1.default);
exports.default = app;

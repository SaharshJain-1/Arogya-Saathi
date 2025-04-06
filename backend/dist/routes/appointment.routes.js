"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/appointments
router.post('/', auth_middleware_1.authenticate, appointment_controller_1.createAppointment);
// GET /api/appointments
router.get('/', auth_middleware_1.authenticate, appointment_controller_1.getAppointments);
// GET /api/appointments/:id
router.get('/:id', auth_middleware_1.authenticate, appointment_controller_1.getAppointmentById);
// PUT /api/appointments/:id
router.put('/:id', auth_middleware_1.authenticate, appointment_controller_1.updateAppointment);
// DELETE /api/appointments/:id
router.delete('/:id', auth_middleware_1.authenticate, appointment_controller_1.deleteAppointment);
// POST /api/appointments/:id/prescription
router.post('/:id/prescription', auth_middleware_1.authenticate, appointment_controller_1.addPrescription);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slot_controller_1 = require("../controllers/slot.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// POST /api/slots
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(['DOCTOR']), slot_controller_1.createSlot);
// GET /api/slots
router.get('/', slot_controller_1.getAvailableSlots);
// GET /api/slots/doctor/:doctorId
router.get('/doctor/:doctorId', slot_controller_1.getDoctorSlots);
// PUT /api/slots/:id
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(['DOCTOR']), slot_controller_1.updateSlot);
// DELETE /api/slots/:id
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(['DOCTOR']), slot_controller_1.deleteSlot);
exports.default = router;

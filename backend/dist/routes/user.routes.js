"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// GET /api/users
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(['ADMIN']), user_controller_1.getAllUsers);
// GET /api/users/doctors
router.get('/doctors', user_controller_1.getAllDoctors);
// GET /api/users/patients
router.get('/patients', auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(['DOCTOR']), user_controller_1.getAllPatients);
// GET /api/users/:id
router.get('/:id', auth_middleware_1.authenticate, user_controller_1.getUserById);
// PUT /api/users/:id
router.put('/:id', auth_middleware_1.authenticate, user_controller_1.updateUser);
exports.default = router;

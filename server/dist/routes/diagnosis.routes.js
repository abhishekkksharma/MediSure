"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnosis_controller_1 = require("../controllers/diagnosis.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Step 1: Ask AI for follow-up triage questions based on symptoms
router.post('/questions', diagnosis_controller_1.getDiagnosisQuestions);
// Step 2: Finalize AI diagnosis and automatically book a matching doctor appointment
router.post('/complete', auth_middleware_1.authenticate, (0, auth_middleware_1.requirePermission)('diagnosis:create'), diagnosis_controller_1.completeDiagnosisAndBook);
exports.default = router;

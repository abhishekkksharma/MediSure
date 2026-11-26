"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bloodRequest_controller_1 = require("../controllers/bloodRequest.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Search matching donors by bloodGroup, city, and state
router.get('/donors', bloodRequest_controller_1.searchDonors);
// Create a blood request and email all matching donors in the area
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requirePermission)('blood_request:create'), bloodRequest_controller_1.createBloodRequest);
// List blood requests
router.get('/', auth_middleware_1.authenticate, bloodRequest_controller_1.getBloodRequests);
exports.default = router;

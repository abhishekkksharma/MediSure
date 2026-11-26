"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBloodRequests = exports.createBloodRequest = exports.searchDonors = void 0;
const bloodRequest_service_1 = require("../services/bloodRequest.service");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * GET /api/blood-requests/donors
 * Finds active, available donors matching bloodGroup, city, and state.
 */
const searchDonors = async (req, res) => {
    try {
        const { bloodGroup, city, state } = req.query;
        const authUser = req.user;
        const result = await (0, bloodRequest_service_1.searchAreaDonorsService)({
            bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : '',
            city: typeof city === 'string' ? city : undefined,
            state: typeof state === 'string' ? state : undefined,
            excludeUserId: authUser?._id.toString(),
        });
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to search blood donors');
    }
};
exports.searchDonors = searchDonors;
/**
 * POST /api/blood-requests
 * Creates a blood donor request and emails all matching donors in that area.
 */
const createBloodRequest = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const result = await (0, bloodRequest_service_1.createAndNotifyBloodRequestService)({
            requesterId: req.user._id.toString(),
            bloodGroup: req.body.bloodGroup,
            unitsRequired: req.body.unitsRequired,
            urgency: req.body.urgency,
            city: req.body.city,
            state: req.body.state,
            hospitalName: req.body.hospitalName,
            contactPhone: req.body.contactPhone,
            requirements: req.body.requirements,
        });
        res.status(201).json({
            message: result.emailDelivery.message,
            ...result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to create blood donor request');
    }
};
exports.createBloodRequest = createBloodRequest;
/**
 * GET /api/blood-requests
 */
const getBloodRequests = async (req, res) => {
    try {
        const onlyMine = req.query.mine === 'true' && req.user;
        const requests = await (0, bloodRequest_service_1.listBloodRequestsService)(onlyMine ? req.user._id.toString() : undefined);
        res.status(200).json({ count: requests.length, requests });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch blood requests');
    }
};
exports.getBloodRequests = getBloodRequests;

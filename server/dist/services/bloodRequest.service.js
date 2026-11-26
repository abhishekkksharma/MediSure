"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBloodRequestsService = exports.createAndNotifyBloodRequestService = exports.getDonorLocationsService = exports.searchAreaDonorsService = void 0;
const bloodRequest_model_1 = __importStar(require("../models/bloodRequest.model"));
const user_model_1 = __importStar(require("../models/user.model"));
const user_service_1 = require("./user.service");
const email_service_1 = require("./email.service");
const ServiceError_1 = require("../utils/ServiceError");
const searchAreaDonorsService = async (params) => {
    return (0, user_service_1.findBloodDonorsService)(params);
};
exports.searchAreaDonorsService = searchAreaDonorsService;
const ALL_INDIAN_STATES_AND_UTS = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
];
const getDonorLocationsService = async (bloodGroup) => {
    const filter = {
        isActive: true,
        isBloodDonorAvailable: true,
        'location.state': { $exists: true, $ne: '' },
    };
    if (bloodGroup && user_model_1.BLOOD_GROUPS.includes(bloodGroup)) {
        filter.bloodGroup = bloodGroup;
    }
    const users = await user_model_1.default.find(filter).select('location.state location.city');
    const citiesMap = new Map();
    for (const stateOrUt of ALL_INDIAN_STATES_AND_UTS) {
        citiesMap.set(stateOrUt, new Set());
    }
    for (const u of users) {
        const state = u.location?.state?.trim();
        const city = u.location?.city?.trim();
        if (!state)
            continue;
        if (!citiesMap.has(state)) {
            citiesMap.set(state, new Set());
        }
        if (city) {
            citiesMap.get(state).add(city);
        }
    }
    const states = Array.from(citiesMap.keys()).sort((a, b) => a.localeCompare(b));
    const citiesByState = {};
    for (const state of states) {
        citiesByState[state] = Array.from(citiesMap.get(state)).sort((a, b) => a.localeCompare(b));
    }
    return { states, citiesByState };
};
exports.getDonorLocationsService = getDonorLocationsService;
const createAndNotifyBloodRequestService = async (input) => {
    if (!input.bloodGroup || !user_model_1.BLOOD_GROUPS.includes(input.bloodGroup)) {
        throw new ServiceError_1.ServiceError(400, `Valid bloodGroup is required (${user_model_1.BLOOD_GROUPS.join(', ')})`);
    }
    const requester = await user_model_1.default.findById(input.requesterId);
    if (!requester || !requester.isActive) {
        throw new ServiceError_1.ServiceError(404, 'Active requester account not found');
    }
    const urgency = input.urgency && bloodRequest_model_1.BLOOD_REQUEST_URGENCIES.includes(input.urgency)
        ? input.urgency
        : 'urgent';
    const { donors } = await (0, user_service_1.findBloodDonorsService)({
        bloodGroup: input.bloodGroup,
        city: input.city,
        state: input.state,
        excludeUserId: requester._id.toString(),
    });
    const donorEmails = donors.map((d) => d.email).filter(Boolean);
    const emailDelivery = await (0, email_service_1.sendBloodRequestEmails)(donorEmails, {
        requesterName: requester.name,
        requesterEmail: requester.email,
        bloodGroup: input.bloodGroup,
        unitsRequired: Math.max(1, Number(input.unitsRequired) || 1),
        urgency,
        city: input.city,
        state: input.state,
        hospitalName: input.hospitalName,
        contactPhone: input.contactPhone || requester.phone,
        requirements: input.requirements,
    });
    const bloodRequest = await bloodRequest_model_1.default.create({
        requester: requester._id,
        bloodGroup: input.bloodGroup,
        unitsRequired: Math.max(1, Number(input.unitsRequired) || 1),
        urgency,
        city: input.city?.trim() || undefined,
        state: input.state?.trim() || undefined,
        hospitalName: input.hospitalName?.trim() || undefined,
        contactPhone: input.contactPhone?.trim() || requester.phone,
        requirements: input.requirements?.trim() || undefined,
        notifiedDonors: donors.map((d) => ({
            donor: d._id,
            email: d.email,
            emailed: emailDelivery.configured && emailDelivery.sentCount > 0,
        })),
    });
    return {
        bloodRequest,
        matchedDonorsCount: donors.length,
        donors,
        emailDelivery,
    };
};
exports.createAndNotifyBloodRequestService = createAndNotifyBloodRequestService;
const listBloodRequestsService = async (requesterId) => {
    const filter = {};
    if (requesterId) {
        filter.requester = requesterId;
    }
    return bloodRequest_model_1.default.find(filter)
        .populate('requester', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(50);
};
exports.listBloodRequestsService = listBloodRequestsService;

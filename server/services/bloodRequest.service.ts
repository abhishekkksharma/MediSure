import BloodRequest, {
  BLOOD_REQUEST_URGENCIES,
  BloodRequestUrgency,
} from '../models/bloodRequest.model';
import User, { BLOOD_GROUPS, BloodGroup } from '../models/user.model';
import { findBloodDonorsService } from './user.service';
import { sendBloodRequestEmails } from './email.service';
import { ServiceError } from '../utils/ServiceError';

export interface CreateBloodRequestInput {
  requesterId: string;
  bloodGroup: BloodGroup;
  unitsRequired?: number;
  urgency?: BloodRequestUrgency;
  city?: string;
  state?: string;
  hospitalName?: string;
  contactPhone?: string;
  requirements?: string;
}

export const searchAreaDonorsService = async (params: {
  bloodGroup: string;
  city?: string;
  state?: string;
  excludeUserId?: string;
}) => {
  return findBloodDonorsService(params);
};

export const getDonorLocationsService = async (bloodGroup?: string) => {
  const filter: Record<string, unknown> = {
    isActive: true,
    isBloodDonorAvailable: true,
    'location.state': { $exists: true, $ne: '' },
  };

  if (bloodGroup && BLOOD_GROUPS.includes(bloodGroup as BloodGroup)) {
    filter.bloodGroup = bloodGroup;
  }

  const users = await User.find(filter).select('location.state location.city');

  const citiesMap = new Map<string, Set<string>>();
  for (const u of users) {
    const state = u.location?.state?.trim();
    const city = u.location?.city?.trim();
    if (!state) continue;

    if (!citiesMap.has(state)) {
      citiesMap.set(state, new Set<string>());
    }
    if (city) {
      citiesMap.get(state)!.add(city);
    }
  }

  const states = Array.from(citiesMap.keys()).sort((a, b) => a.localeCompare(b));
  const citiesByState: Record<string, string[]> = {};
  for (const state of states) {
    citiesByState[state] = Array.from(citiesMap.get(state)!).sort((a, b) =>
      a.localeCompare(b)
    );
  }

  return { states, citiesByState };
};

export const createAndNotifyBloodRequestService = async (
  input: CreateBloodRequestInput
) => {
  if (!input.bloodGroup || !BLOOD_GROUPS.includes(input.bloodGroup)) {
    throw new ServiceError(
      400,
      `Valid bloodGroup is required (${BLOOD_GROUPS.join(', ')})`
    );
  }

  const requester = await User.findById(input.requesterId);
  if (!requester || !requester.isActive) {
    throw new ServiceError(404, 'Active requester account not found');
  }

  const urgency: BloodRequestUrgency =
    input.urgency && BLOOD_REQUEST_URGENCIES.includes(input.urgency)
      ? input.urgency
      : 'urgent';

  const { donors } = await findBloodDonorsService({
    bloodGroup: input.bloodGroup,
    city: input.city,
    state: input.state,
    excludeUserId: requester._id.toString(),
  });

  const donorEmails = donors.map((d) => d.email).filter(Boolean);

  const emailDelivery = await sendBloodRequestEmails(donorEmails, {
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

  const bloodRequest = await BloodRequest.create({
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

export const listBloodRequestsService = async (requesterId?: string) => {
  const filter: Record<string, unknown> = {};
  if (requesterId) {
    filter.requester = requesterId;
  }

  return BloodRequest.find(filter)
    .populate('requester', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(50);
};


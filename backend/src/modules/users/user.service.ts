import bcrypt from "bcrypt";
import type { FilterQuery } from "mongoose";
import { User, type UserDocument } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import type { CreateStaffInput, ListUsersQuery } from "./user.validation";

// Matches auth.service.ts's bcrypt configuration for the clinic-admin flow.
const SALT_ROUNDS = 12;

function toUserDto(user: UserDocument) {
  return {
    id: user._id.toString(),
    clinicId: user.clinicId.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildFilter(clinicId: string, query: ListUsersQuery): FilterQuery<UserDocument> {
  const filter: FilterQuery<UserDocument> = { clinicId };

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }

  return filter;
}

export async function listUsers(clinicId: string, query: ListUsersQuery) {
  const filter = buildFilter(clinicId, query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    User.countDocuments(filter),
  ]);

  return {
    data: items.map(toUserDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function createStaffUser(clinicId: string, input: CreateStaffInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    clinicId,
    name: input.name,
    email: input.email,
    passwordHash,
    role: "staff",
    isActive: true,
  });

  return toUserDto(user);
}

export async function updateUserStatus(
  clinicId: string,
  userId: string,
  requestingUserId: string,
  isActive: boolean,
) {
  const user = await User.findById(userId);
  if (!user || user.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  if (user._id.toString() === requestingUserId) {
    throw new ApiError(400, "You cannot change your own account status", "SELF_STATUS_CHANGE");
  }

  // This endpoint manages staff accounts only - the clinic's admin(s) must
  // always remain active and can't be toggled here.
  if (user.role === "admin") {
    throw new ApiError(
      400,
      "Admin accounts cannot be activated or deactivated here",
      "ADMIN_STATUS_LOCKED",
    );
  }

  user.isActive = isActive;
  await user.save();
  return toUserDto(user);
}

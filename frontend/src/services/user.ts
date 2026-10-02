import { api } from "./api";

import type {
  FreelancerListFilters,
  FreelancerListResult,
  UpdateProfileRequest,
  User,
} from "@/types/user";

import type { Review } from "@/types/review";

interface UserResponse {
  success: boolean;
  message?: string;
  data: { user: User };
}

interface FreelancersResponse {
  success: boolean;
  data: FreelancerListResult;
}

interface UserReviewsResponse {
  success: boolean;
  data: { reviews: Review[] };
}

interface StatusResponse {
  success: boolean;
  message: string;
  data: { user: User };
}

// Admin only. Backend refuses this for the caller's own account and
// for ADMIN-role accounts.
export async function updateUserStatus(
  id: string,
  isActive: boolean,
): Promise<User> {
  const response = await api.patch<StatusResponse>(`/users/${id}/status`, {
    isActive,
  });
  return response.data.data.user;
}

export async function updateMyProfile(
  data: UpdateProfileRequest,
): Promise<User> {
  const response = await api.patch<UserResponse>("/users/me", data);
  return response.data.data.user;
}

export async function listFreelancers(
  filters?: FreelancerListFilters,
): Promise<FreelancerListResult> {
  const response = await api.get<FreelancersResponse>("/users", {
    params: filters,
  });
  return response.data.data;
}

interface AllUsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: FreelancerListResult["pagination"];
  };
}

// Admin only: every user, any role.
export async function listAllUsers(params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<AllUsersResponse>("/users/admin/all", {
    params,
  });
  return response.data.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get<UserResponse>(`/users/${id}`);
  return response.data.data.user;
}

export async function getUserReviews(id: string): Promise<Review[]> {
  const response = await api.get<UserReviewsResponse>(
    `/users/${id}/reviews`,
  );
  return response.data.data.reviews;
}

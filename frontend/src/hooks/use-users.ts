import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getUserById,
  getUserReviews,
  listAllUsers,
  listFreelancers,
  updateMyProfile,
  updateUserStatus,
} from "@/services/user";

import type {
  FreelancerListFilters,
  UpdateProfileRequest,
} from "@/types/user";

export const userKeys = {
  all: ["users"] as const,
  freelancers: (filters?: FreelancerListFilters) =>
    [...userKeys.all, "freelancers", filters] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  reviews: (id: string) => [...userKeys.all, "reviews", id] as const,
};

export function useFreelancers(filters?: FreelancerListFilters) {
  return useQuery({
    queryKey: userKeys.freelancers(filters),
    queryFn: () => listFreelancers(filters),
  });
}

export function useAllUsers(params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...userKeys.all, "admin", params] as const,
    queryFn: () => listAllUsers(params),
  });
}

export function useUserProfile(id?: string) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => getUserById(id!),
    enabled: Boolean(id),
  });
}

export function useUserReviews(id?: string) {
  return useQuery({
    queryKey: userKeys.reviews(id ?? ""),
    queryFn: () => getUserReviews(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateMyProfile(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

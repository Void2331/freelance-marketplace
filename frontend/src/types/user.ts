import type { UserRole } from "./auth";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;

  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  skills?: string[] | null;
  hourlyRate?: number | null;

  averageRating?: number | null;
  reviewCount?: number | null;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  hourlyRate?: number;
  avatar?: string;
}

export interface FreelancerListFilters {
  skill?: string;
  search?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface FreelancerListResult {
  freelancers: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
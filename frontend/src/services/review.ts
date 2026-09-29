import { api } from "./api";

import type {
  CreateReviewRequest,
  Review,
} from "@/types/review";

interface CreateReviewResponse {
  success: boolean;
  message: string;
  // Note: unlike most endpoints in this API, createReview returns
  // the review directly under `data` rather than under `data.review`.
  data: Review;
}

interface ReviewsResponse {
  success: boolean;
  data: { reviews: Review[] };
}

export async function createReview(
  projectId: string,
  data: CreateReviewRequest,
): Promise<Review> {
  const response = await api.post<CreateReviewResponse>(
    `/projects/${projectId}/review`,
    data,
  );
  return response.data.data;
}

export async function getProjectReviews(
  projectId: string,
): Promise<Review[]> {
  const response = await api.get<ReviewsResponse>(
    `/projects/${projectId}/reviews`,
  );
  return response.data.data.reviews;
}

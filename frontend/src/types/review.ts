export interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string | null;
  role?: string;
}

export interface Review {
  _id: string;
  project: string;
  reviewer: string | ReviewUser;
  reviewee: string | ReviewUser;
  rating: number;
  communicationRating?: number;
  qualityRating?: number;
  deadlineRating?: number;
  comment: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  communicationRating?: number;
  qualityRating?: number;
  deadlineRating?: number;
  comment?: string;
}

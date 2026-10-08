export type TrustTier = "NEW" | "RISING" | "TRUSTED" | "TOP_RATED";

export interface TrustScore {
  // null until the freelancer has completed a project
  score: number | null;
  tier: TrustTier;
  completedProjects: number;

  // each value is 0-100, or null when there is no data yet
  breakdown: {
    reviews: number | null;
    onTime: number | null;
    disputes: number | null;
    completion: number | null;
    repeatClients: number | null;
  };

  facts: {
    reviewCount: number;
    onTimeDeliveries: number;
    onTimeEligible: number;
    disputesLost: number;
    repeatClients: number;
  };
}
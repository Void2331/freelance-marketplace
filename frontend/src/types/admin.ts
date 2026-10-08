export interface AdminStats {
  users: {
    total: number;
    freelancers: number;
    clients: number;
    newThisMonth: number;
    growthPercent: number | null;
  };
  jobs: { open: number };
  projects: { active: number; completed: number; cancelled: number };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    changePercent: number | null;
    otherCurrencies: Record<string, number>;
  };
  attention: {
    openDisputes: number;
    refundsPending: number;
    withdrawalsInFlight: number;
    withdrawalsStuck: number;
  };
  health: {
    verifiedUsersPercent: number | null;
    completionRatePercent: number | null;
  };
  recentProjects: {
    _id: string;
    title: string;
    client: string;
    freelancer: string;
    amount: number;
    currency: string;
    status: string;
  }[];
  recentActivity: {
    _id: string;
    type: string;
    message: string;
    projectTitle: string;
    createdAt: string;
  }[];
}

export interface AdminPayment {
  _id: string;
  status: string;
  amount: number;
  clientFee: number;
  freelancerFee: number;
  currency: string;
  client: string;
  freelancer: string;
  project: string;
  milestone: string;
  reference: string;
  refundAmount: number | null;
  lastRefundRetry: {
    at: string;
    outcome: string;
    reason?: string;
  } | null;
  createdAt: string;
}

export interface AdminWithdrawal {
  _id: string;
  status: string;
  amount: number;
  freelancer: string;
  reference: string;
  failureReason: string;
  stuck: boolean;
  createdAt: string;
}

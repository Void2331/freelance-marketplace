const User = require("../models/user.js");
const Job = require("../models/job.js");
const Project = require("../models/project.js");
const Payment = require("../models/Payment.js");
const Withdrawal = require("../models/Withdrawal.js");
const Dispute = require("../models/Dispute.js");
const ProjectActivity = require("../models/projectActivity.js");

/*
====================================================
ADMIN DASHBOARD NUMBERS
Everything here is counted from the real database.
Fees collected are only counted as revenue once the
payment has been RELEASED to the freelancer, so money
that is refunded or still held in escrow never inflates
the figure.
====================================================
*/

const OPEN_DISPUTE_STATUSES = ["OPEN", "UNDER_REVIEW", "AWAITING_RESPONSE"];

// A transfer that has sat in PROCESSING this long needs a human look.
const STUCK_WITHDRAWAL_MS = 60 * 60 * 1000;

/*
 * Percentage change from `previous` to `current`.
 * Returns null when there is no earlier figure to compare to.
 */
const percentChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const percentOf = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;

const monthStart = (date, offset = 0) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

const revenueBetween = async (from, to) => {
  const rows = await Payment.aggregate([
    {
      $match: {
        status: "RELEASED",
        releasedAt: { $gte: from, $lt: to },
      },
    },
    {
      $group: {
        _id: "$currency",
        total: {
          $sum: {
            $add: [
              { $ifNull: ["$clientFee", 0] },
              { $ifNull: ["$freelancerFee", 0] },
            ],
          },
        },
      },
    },
  ]);

  // The platform runs in NGN; other currencies are listed separately.
  const byCurrency = Object.fromEntries(rows.map((row) => [row._id, row.total]));

  return { NGN: byCurrency.NGN || 0, byCurrency };
};

const getAdminStats = async (now = new Date()) => {
  const thisMonth = monthStart(now);
  const lastMonth = monthStart(now, -1);
  const nextMonth = monthStart(now, 1);
  const stuckBefore = new Date(now.getTime() - STUCK_WITHDRAWAL_MS);

  const [
    totalUsers,
    freelancers,
    clients,
    verifiedUsers,
    newThisMonth,
    newLastMonth,
    openJobs,
    activeProjects,
    completedProjects,
    cancelledProjects,
    openDisputes,
    refundsPending,
    withdrawalsInFlight,
    withdrawalsStuck,
    revenueThisMonth,
    revenueLastMonth,
    recentProjects,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "FREELANCER" }),
    User.countDocuments({ role: "CLIENT" }),
    User.countDocuments({ isEmailVerified: true }),
    User.countDocuments({ createdAt: { $gte: thisMonth } }),
    User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),

    Job.countDocuments({ status: "OPEN" }),

    Project.countDocuments({ status: "IN_PROGRESS" }),
    Project.countDocuments({ status: "COMPLETED" }),
    Project.countDocuments({ status: "CANCELLED" }),

    Dispute.countDocuments({ status: { $in: OPEN_DISPUTE_STATUSES } }),

    Payment.countDocuments({ status: "REFUND_PENDING" }),
    Withdrawal.countDocuments({ status: { $in: ["PENDING", "PROCESSING"] } }),
    Withdrawal.countDocuments({
      status: { $in: ["PENDING", "PROCESSING"] },
      updatedAt: { $lt: stuckBefore },
    }),

    revenueBetween(thisMonth, nextMonth),
    revenueBetween(lastMonth, thisMonth),

    Project.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title totalAmount currency status client freelancer")
      .populate("client", "name")
      .populate("freelancer", "name")
      .lean(),

    ProjectActivity.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("type message project createdAt")
      .populate("project", "title")
      .lean(),
  ]);

  return {
    users: {
      total: totalUsers,
      freelancers,
      clients,
      newThisMonth,
      growthPercent: percentChange(newThisMonth, newLastMonth),
    },
    jobs: { open: openJobs },
    projects: {
      active: activeProjects,
      completed: completedProjects,
      cancelled: cancelledProjects,
    },
    revenue: {
      thisMonth: revenueThisMonth.NGN,
      lastMonth: revenueLastMonth.NGN,
      changePercent: percentChange(revenueThisMonth.NGN, revenueLastMonth.NGN),
      otherCurrencies: Object.fromEntries(
        Object.entries(revenueThisMonth.byCurrency).filter(
          ([currency]) => currency !== "NGN"
        )
      ),
    },
    attention: {
      openDisputes,
      refundsPending,
      withdrawalsInFlight,
      withdrawalsStuck,
    },
    health: {
      verifiedUsersPercent: percentOf(verifiedUsers, totalUsers),
      completionRatePercent: percentOf(
        completedProjects,
        completedProjects + cancelledProjects
      ),
    },
    recentProjects: recentProjects.map((project) => ({
      _id: project._id,
      title: project.title,
      client: project.client?.name || "—",
      freelancer: project.freelancer?.name || "—",
      amount: project.totalAmount,
      currency: project.currency,
      status: project.status,
    })),
    recentActivity: recentActivity.map((event) => ({
      _id: event._id,
      type: event.type,
      message: event.message,
      projectTitle: event.project?.title || "",
      createdAt: event.createdAt,
    })),
  };
};

module.exports = { getAdminStats, percentChange, percentOf };

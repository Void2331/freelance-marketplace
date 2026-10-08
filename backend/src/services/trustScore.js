const mongoose = require("mongoose");

const Review = require("../models/review.js");
const Milestone = require("../models/milestone.js");
const Dispute = require("../models/Dispute.js");
const Project = require("../models/project.js");

/*
====================================================
FREELANCER TRUST SCORE (0-100)

Built only from data the platform already records,
so it cannot be bought or self-reported:

  reviews        35  smoothed average review rating
  onTime         25  milestones delivered by their due date
  disputes       20  disputes lost vs milestones delivered
  completion     10  completed vs cancelled projects
  repeatClients  10  clients who hired them again

Components with no data yet are left out and the
remaining weights are scaled up, so a brand new
freelancer is never punished for having no history.
====================================================
*/

const WEIGHTS = {
  reviews: 35,
  onTime: 25,
  disputes: 20,
  completion: 10,
  repeatClients: 10,
};

// Delivering on the due date itself still counts as on time.
const GRACE_MS = 24 * 60 * 60 * 1000;

// A review average of 5.0 from one review is not proof of
// anything, so pull small samples toward a neutral prior.
const REVIEW_PRIOR_MEAN = 4;
const REVIEW_PRIOR_WEIGHT = 3;

const OPEN_MILESTONE_STATUSES = [
  "FUNDED",
  "IN_PROGRESS",
  "REVISION_REQUESTED",
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/*
 * PURE FUNCTION: raw counts in, score out.
 * No database access, so it can be unit tested.
 */
const calculateTrust = (stats = {}) => {
  const {
    reviewCount = 0,
    reviewAverage = 0,
    onTimeEligible = 0,
    onTimeCount = 0,
    completedProjects = 0,
    cancelledProjects = 0,
    deliveredMilestones = 0,
    disputesLost = 0,
    disputesPartial = 0,
    distinctClients = 0,
    repeatClients = 0,
  } = stats;

  const components = {};

  if (reviewCount > 0) {
    const smoothed =
      (reviewAverage * reviewCount +
        REVIEW_PRIOR_MEAN * REVIEW_PRIOR_WEIGHT) /
      (reviewCount + REVIEW_PRIOR_WEIGHT);

    components.reviews = clamp01((smoothed - 1) / 4);
  }

  if (onTimeEligible > 0) {
    components.onTime = clamp01(onTimeCount / onTimeEligible);
  }

  if (deliveredMilestones > 0 || disputesLost > 0) {
    // A partial settlement counts as half a lost dispute.
    const penalty = disputesLost + disputesPartial * 0.5;

    // Divide by at least 3 so one early dispute is not fatal.
    components.disputes = clamp01(
      1 - penalty / Math.max(deliveredMilestones, 3)
    );
  }

  const finishedProjects = completedProjects + cancelledProjects;

  if (finishedProjects > 0) {
    components.completion = clamp01(
      completedProjects / finishedProjects
    );
  }

  if (completedProjects > 0 && distinctClients > 0) {
    // Everyone returning would be 100%, but only a good
    // reputation needs about half of clients to come back.
    components.repeatClients = clamp01(
      repeatClients / distinctClients / 0.5
    );
  }

  let weightTotal = 0;
  let weighted = 0;

  Object.keys(components).forEach((key) => {
    weightTotal += WEIGHTS[key];
    weighted += WEIGHTS[key] * components[key];
  });

  const hasHistory = completedProjects > 0 && weightTotal > 0;

  const score = hasHistory
    ? Math.round((weighted / weightTotal) * 100)
    : null;

  let tier = "NEW";

  if (hasHistory) {
    if (score >= 90 && completedProjects >= 5) tier = "TOP_RATED";
    else if (score >= 75 && completedProjects >= 3) tier = "TRUSTED";
    else tier = "RISING";
  }

  const percent = (value) =>
    value === undefined ? null : Math.round(value * 100);

  return {
    score,
    tier,
    completedProjects,
    breakdown: {
      reviews: percent(components.reviews),
      onTime: percent(components.onTime),
      disputes: percent(components.disputes),
      completion: percent(components.completion),
      repeatClients: percent(components.repeatClients),
    },
    facts: {
      reviewCount,
      onTimeDeliveries: onTimeCount,
      onTimeEligible,
      disputesLost,
      repeatClients,
    },
  };
};

const toObjectIds = (ids) =>
  [...new Set(ids.filter(Boolean).map(String))]
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

/*
====================================================
BATCH LOOKUP
Returns { [freelancerId]: trust } for any number of
freelancers using a fixed number of queries, so a list
of 50 freelancers costs the same as a list of 1.
====================================================
*/
const getTrustScores = async (userIds) => {
  const ids = toObjectIds(userIds);
  const result = {};

  if (ids.length === 0) return result;

  const [reviews, milestones, projects] = await Promise.all([
    Review.aggregate([
      { $match: { reviewee: { $in: ids } } },
      {
        $group: {
          _id: "$reviewee",
          count: { $sum: 1 },
          average: { $avg: "$rating" },
        },
      },
    ]),

    Milestone.find({
      freelancer: { $in: ids },
      status: { $nin: ["PENDING", "CANCELLED", "REJECTED"] },
    })
      .select("freelancer status dueDate submittedAt")
      .lean(),

    Project.find({
      freelancer: { $in: ids },
      status: { $in: ["COMPLETED", "CANCELLED"] },
    })
      .select("freelancer client status")
      .lean(),
  ]);

  const milestoneOwner = new Map(
    milestones.map((m) => [String(m._id), String(m.freelancer)])
  );

  const resolvedDisputes = milestones.length
    ? await Dispute.find({
        milestone: { $in: milestones.map((m) => m._id) },
        status: { $in: ["RESOLVED_CLIENT", "PARTIAL_RESOLUTION"] },
      })
        .select("milestone status")
        .lean()
    : [];

  const stats = {};

  const statsFor = (id) => {
    if (!stats[id]) {
      stats[id] = {
        reviewCount: 0,
        reviewAverage: 0,
        onTimeEligible: 0,
        onTimeCount: 0,
        completedProjects: 0,
        cancelledProjects: 0,
        deliveredMilestones: 0,
        disputesLost: 0,
        disputesPartial: 0,
        distinctClients: 0,
        repeatClients: 0,
      };
    }
    return stats[id];
  };

  ids.forEach((id) => statsFor(String(id)));

  reviews.forEach((row) => {
    const s = statsFor(String(row._id));
    s.reviewCount = row.count;
    s.reviewAverage = row.average;
  });

  const now = Date.now();

  milestones.forEach((m) => {
    const s = statsFor(String(m.freelancer));

    if (["RELEASED", "APPROVED"].includes(m.status)) {
      s.deliveredMilestones += 1;
    }

    if (!m.dueDate) return;

    const deadline = new Date(m.dueDate).getTime() + GRACE_MS;

    if (m.submittedAt) {
      s.onTimeEligible += 1;

      if (new Date(m.submittedAt).getTime() <= deadline) {
        s.onTimeCount += 1;
      }
    } else if (
      OPEN_MILESTONE_STATUSES.includes(m.status) &&
      deadline < now
    ) {
      // Overdue and still not delivered: counts as late.
      s.onTimeEligible += 1;
    }
  });

  resolvedDisputes.forEach((d) => {
    const owner = milestoneOwner.get(String(d.milestone));
    if (!owner) return;

    const s = statsFor(owner);

    if (d.status === "RESOLVED_CLIENT") s.disputesLost += 1;
    else s.disputesPartial += 1;
  });

  const clientCounts = {};

  projects.forEach((p) => {
    const freelancerId = String(p.freelancer);
    const s = statsFor(freelancerId);

    if (p.status === "CANCELLED") {
      s.cancelledProjects += 1;
      return;
    }

    s.completedProjects += 1;

    if (!clientCounts[freelancerId]) clientCounts[freelancerId] = {};

    const clientId = String(p.client);
    clientCounts[freelancerId][clientId] =
      (clientCounts[freelancerId][clientId] || 0) + 1;
  });

  Object.keys(clientCounts).forEach((freelancerId) => {
    const counts = Object.values(clientCounts[freelancerId]);
    const s = statsFor(freelancerId);

    s.distinctClients = counts.length;
    s.repeatClients = counts.filter((n) => n >= 2).length;
  });

  Object.keys(stats).forEach((id) => {
    result[id] = calculateTrust(stats[id]);
  });

  return result;
};

const getTrustScore = async (userId) => {
  const scores = await getTrustScores([userId]);
  return scores[String(userId)] || calculateTrust({});
};

/*
 * Attaches `trust` to a list of items that each have a
 * freelancer (a user doc/object or an id).
 */
const attachTrust = async (items, pickUser) => {
  const trust = await getTrustScores(
    items.map((item) => {
      const user = pickUser(item);
      return user?._id ?? user;
    })
  );

  return items.map((item) => {
    const user = pickUser(item);
    const id = String(user?._id ?? user);

    return { item, trust: trust[id] || calculateTrust({}) };
  });
};

module.exports = {
  calculateTrust,
  getTrustScores,
  getTrustScore,
  attachTrust,
};
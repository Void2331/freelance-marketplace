const test = require("node:test");
const assert = require("node:assert");

const { calculateTrust } = require("../src/services/trustScore.js");

test("a brand new freelancer has no score and the NEW tier", () => {
  const result = calculateTrust({});

  assert.strictEqual(result.score, null);
  assert.strictEqual(result.tier, "NEW");
});

test("missing data is not punished: no reviews yet still scores well", () => {
  const result = calculateTrust({
    completedProjects: 1,
    onTimeEligible: 1,
    onTimeCount: 1,
    deliveredMilestones: 1,
  });

  assert.ok(result.score >= 90);
  assert.strictEqual(result.tier, "RISING");
  assert.strictEqual(result.breakdown.reviews, null);
});

test("a single 5-star review is smoothed, not treated as 100%", () => {
  const result = calculateTrust({
    completedProjects: 1,
    reviewCount: 1,
    reviewAverage: 5,
  });

  assert.ok(result.breakdown.reviews < 90);
});

test("a strong record reaches TOP_RATED", () => {
  const result = calculateTrust({
    completedProjects: 8,
    reviewCount: 8,
    reviewAverage: 4.9,
    onTimeEligible: 20,
    onTimeCount: 20,
    deliveredMilestones: 20,
    distinctClients: 5,
    repeatClients: 3,
  });

  assert.strictEqual(result.tier, "TOP_RATED");
});

test("lost disputes, late work and cancellations pull the score down", () => {
  const good = calculateTrust({
    completedProjects: 6,
    reviewCount: 6,
    reviewAverage: 4.8,
    onTimeEligible: 10,
    onTimeCount: 10,
    deliveredMilestones: 10,
    distinctClients: 6,
    repeatClients: 2,
  });

  const bad = calculateTrust({
    completedProjects: 6,
    cancelledProjects: 3,
    reviewCount: 6,
    reviewAverage: 3.2,
    onTimeEligible: 10,
    onTimeCount: 4,
    deliveredMilestones: 10,
    disputesLost: 3,
    distinctClients: 6,
  });

  assert.ok(bad.score < good.score);
  assert.ok(bad.score < 60);
  assert.strictEqual(bad.tier, "RISING");
});

test("two partial settlements equal one lost dispute", () => {
  const lost = calculateTrust({
    completedProjects: 4,
    deliveredMilestones: 6,
    disputesLost: 1,
  });

  const partial = calculateTrust({
    completedProjects: 4,
    deliveredMilestones: 6,
    disputesPartial: 2,
  });

  assert.strictEqual(
    lost.breakdown.disputes,
    partial.breakdown.disputes
  );
});

test("the score always stays between 0 and 100", () => {
  for (let i = 0; i < 300; i += 1) {
    const { score } = calculateTrust({
      completedProjects: Math.floor(Math.random() * 10),
      cancelledProjects: Math.floor(Math.random() * 5),
      reviewCount: Math.floor(Math.random() * 10),
      reviewAverage: 1 + Math.random() * 4,
      onTimeEligible: 10,
      onTimeCount: Math.floor(Math.random() * 11),
      deliveredMilestones: Math.floor(Math.random() * 10),
      disputesLost: Math.floor(Math.random() * 6),
      distinctClients: 5,
      repeatClients: Math.floor(Math.random() * 6),
    });

    assert.ok(score === null || (score >= 0 && score <= 100));
  }
});
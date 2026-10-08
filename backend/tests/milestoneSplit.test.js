const test = require("node:test");
const assert = require("node:assert");

const { splitAmount, planMilestoneDrafts } = require("../src/services/milestoneSplit.js");

const kobo = (amounts) => Math.round(amounts.reduce((sum, value) => sum + value, 0) * 100);

test("splitAmount: whole-naira bids split into whole naira that add up exactly", () => {
  assert.deepStrictEqual(splitAmount(150000, [30, 50, 20]), [45000, 75000, 30000]);

  // 100,001 does not divide evenly: still exact, still whole naira
  const parts = splitAmount(100001, [33, 33, 34]);
  assert.strictEqual(parts.reduce((a, b) => a + b, 0), 100001);
  assert.ok(parts.every(Number.isInteger));
});

test("splitAmount: bids with kobo split in kobo and still add up exactly", () => {
  const parts = splitAmount(100000.5, [33, 33, 34]);
  assert.strictEqual(kobo(parts), 10000050);
});

test("splitAmount: any total and any percentages always add up exactly", () => {
  for (let i = 0; i < 1000; i += 1) {
    const count = 1 + Math.floor(Math.random() * 6);
    // random percentages that total 100
    let left = 100;
    const percentages = Array.from({ length: count }, (_, index) => {
      if (index === count - 1) return left;
      const value = Math.max(1, Math.floor(Math.random() * (left - (count - index - 1))));
      left -= value;
      return value;
    });

    const total = Math.random() < 0.5
      ? 1000 + Math.floor(Math.random() * 5_000_000)
      : Math.round((1000 + Math.random() * 5_000_000) * 100) / 100;

    const parts = splitAmount(total, percentages);

    assert.strictEqual(kobo(parts), Math.round(total * 100), `total ${total} split ${percentages}`);
    assert.ok(parts.every((value) => value >= 0));
  }
});

const plan = [
  { title: "Design", description: "Mockups", percentage: 30 },
  { title: "Build", description: "", percentage: 50 },
  { title: "Launch", description: "Deploy", percentage: 20 },
];

test("planMilestoneDrafts: a valid plan becomes ordered drafts that total the bid", () => {
  const drafts = planMilestoneDrafts(plan, 150000);

  assert.deepStrictEqual(drafts.map((draft) => draft.amount), [45000, 75000, 30000]);
  assert.deepStrictEqual(drafts.map((draft) => draft.order), [1, 2, 3]);
  assert.strictEqual(drafts[0].title, "Design");
  // empty descriptions get a sensible default (the model requires one)
  assert.ok(drafts[1].description.length > 0);
});

test("planMilestoneDrafts: the plan is applied to the BID, not the job budget", () => {
  const drafts = planMilestoneDrafts(plan, 80000);
  assert.strictEqual(drafts.reduce((sum, draft) => sum + draft.amount, 0), 80000);
});

test("planMilestoneDrafts: anything untrustworthy falls back to no plan", () => {
  assert.deepStrictEqual(planMilestoneDrafts(undefined, 1000), []);
  assert.deepStrictEqual(planMilestoneDrafts([], 1000), []);
  assert.deepStrictEqual(planMilestoneDrafts("nope", 1000), []);

  // does not add up to 100
  assert.deepStrictEqual(planMilestoneDrafts([{ title: "A", percentage: 40 }, { title: "B", percentage: 50 }], 1000), []);
  // a step with no title
  assert.deepStrictEqual(planMilestoneDrafts([{ title: " ", percentage: 50 }, { title: "B", percentage: 50 }], 1000), []);
  // a step with 0 or a non-number share
  assert.deepStrictEqual(planMilestoneDrafts([{ title: "A", percentage: 0 }, { title: "B", percentage: 100 }], 1000), []);
  assert.deepStrictEqual(planMilestoneDrafts([{ title: "A", percentage: "x" }, { title: "B", percentage: 100 }], 1000), []);
  // bad bid
  assert.deepStrictEqual(planMilestoneDrafts(plan, 0), []);
  assert.deepStrictEqual(planMilestoneDrafts(plan, NaN), []);
});

test("planMilestoneDrafts: a share that rounds to nothing falls back instead of creating a free milestone", () => {
  const tiny = [{ title: "A", percentage: 1 }, { title: "B", percentage: 99 }];
  assert.deepStrictEqual(planMilestoneDrafts(tiny, 10), []);
});

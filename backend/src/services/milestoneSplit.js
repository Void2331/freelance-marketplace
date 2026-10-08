/*
====================================================
PAYMENT PLAN -> MILESTONES

A job can carry a payment plan: milestones with a share
(percentage) of the budget. When the client accepts a
proposal, those shares are applied to the freelancer's
BID, and the amounts must add up to the bid exactly,
not 1 naira short or over, or the project's budget
check and the money would not agree.
====================================================
*/

/*
 * Splits `total` by percentages using the largest-remainder
 * method. Whole-naira bids are split in whole naira; bids with
 * kobo are split in kobo. The amounts always add up to `total`.
 */
const splitAmount = (total, percentages) => {
  const wholeNaira = Number.isInteger(total);
  const unit = wholeNaira ? 1 : 0.01;
  const totalUnits = Math.round(total / unit);

  const exact = percentages.map((pct) => (totalUnits * pct) / 100);
  const units = exact.map((value) => Math.floor(value));

  let remaining = totalUnits - units.reduce((sum, value) => sum + value, 0);

  const byFraction = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  // Give the missing units to the largest remainders first.
  for (let i = 0; remaining > 0; i = (i + 1) % byFraction.length) {
    units[byFraction[i].index] += 1;
    remaining -= 1;
  }

  return units.map((value) => Math.round(value * unit * 100) / 100);
};

/*
 * Turns a job's plan into milestone drafts for a given bid.
 *
 * Returns [] (meaning "use one milestone, as before") when the
 * plan is missing or cannot be trusted, so a bad plan can never
 * block a proposal from being accepted.
 */
const planMilestoneDrafts = (plan, bidAmount) => {
  if (!Array.isArray(plan) || plan.length === 0) return [];

  const items = plan.map((item) => ({
    title: String(item?.title ?? "").trim(),
    description: String(item?.description ?? "").trim(),
    percentage: Number(item?.percentage),
  }));

  const valid =
    items.every(
      (item) =>
        item.title && Number.isFinite(item.percentage) && item.percentage > 0
    ) &&
    Math.round(items.reduce((sum, item) => sum + item.percentage, 0) * 100) ===
      10000;

  if (!valid || !(Number(bidAmount) > 0)) return [];

  const amounts = splitAmount(
    Number(bidAmount),
    items.map((item) => item.percentage)
  );

  // A share so small it rounds to nothing cannot be a milestone.
  if (amounts.some((amount) => amount <= 0)) return [];

  return items.map((item, index) => ({
    title: item.title,
    description: item.description || "Complete the agreed work for this milestone.",
    amount: amounts[index],
    order: index + 1,
  }));
};

module.exports = { splitAmount, planMilestoneDrafts };

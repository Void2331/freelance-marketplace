import type { MilestonePlanItem } from "@/types/job";

export function planTotal(plan: MilestonePlanItem[]): number {
  return plan.reduce(
    (sum, item) => sum + (Number.isFinite(item.percentage) ? item.percentage : 0),
    0,
  );
}

/*
 * Splits `total` by percentages, largest remainder first, so the
 * amounts always add up to `total` exactly. This mirrors the backend
 * (services/milestoneSplit.js) so the preview matches what is created.
 */
export function splitAmount(total: number, percentages: number[]): number[] {
  const unit = Number.isInteger(total) ? 1 : 0.01;
  const totalUnits = Math.round(total / unit);

  const exact = percentages.map((pct) => (totalUnits * pct) / 100);
  const units = exact.map((value) => Math.floor(value));

  let remaining = totalUnits - units.reduce((sum, value) => sum + value, 0);

  const byFraction = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let i = 0; remaining > 0; i = (i + 1) % byFraction.length) {
    units[byFraction[i].index] += 1;
    remaining -= 1;
  }

  return units.map((value) => Math.round(value * unit * 100) / 100);
}

/*
 * The text shown before a client accepts a bid. When the job has a
 * valid payment plan it lists the milestones that will be created.
 */
export function acceptConfirmText(
  plan: MilestonePlanItem[] | undefined,
  bidAmount: number,
): string {
  const single =
    "Accept this proposal? This will create a project, contract, milestone and payment record.";

  const usable =
    Array.isArray(plan) &&
    plan.length > 0 &&
    plan.every((item) => item.title?.trim() && item.percentage > 0) &&
    planTotal(plan) === 100 &&
    bidAmount > 0;

  if (!usable) return single;

  const amounts = splitAmount(
    bidAmount,
    plan.map((item) => item.percentage),
  );

  const lines = plan.map(
    (item, index) =>
      `${index + 1}. ${item.title}: ₦${amounts[index].toLocaleString()} (${item.percentage}%)`,
  );

  return [
    "Accept this proposal?",
    "",
    `The job's payment plan will be applied to this bid of ₦${bidAmount.toLocaleString()}:`,
    ...lines,
    "",
    `This creates the project, contract and these ${plan.length} milestones. You fund each milestone separately, and money is only released when you approve the work.`,
  ].join("\n");
}

export function acceptedMessage(milestoneCount?: number): string {
  return milestoneCount && milestoneCount > 1
    ? `Proposal accepted. ${milestoneCount} milestones created from the payment plan.`
    : "Proposal accepted and project created.";
}

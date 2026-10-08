import type { MilestonePlanItem } from "@/types/job";

interface PaymentPlanProps {
  plan?: MilestonePlanItem[];
  budget: number;
  currency: string;
  budgetType: "FIXED" | "HOURLY";
}

/* Read-only plan shown to freelancers on the public job page. */
export function PaymentPlan({
  plan,
  budget,
  currency,
  budgetType,
}: PaymentPlanProps) {
  if (!plan || plan.length === 0) return null;

  return (
    <>
      <h2 className="mt-6 font-semibold">Payment plan</h2>

      <p className="mt-1 text-xs text-zinc-500">
        The client plans to pay in {plan.length} milestone
        {plan.length === 1 ? "" : "s"}. Each one is released after the client
        approves the delivered work.
      </p>

      <ol className="mt-3 space-y-2">
        {plan.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>

              {item.description && (
                <p className="mt-0.5 text-sm text-zinc-500">
                  {item.description}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right text-sm">
              <p className="font-semibold">{item.percentage}%</p>

              {budgetType === "FIXED" && (
                <p className="text-xs text-zinc-500">
                  {currency} {Math.round((budget * item.percentage) / 100).toLocaleString()}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

import { Award, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import type { TrustScore, TrustTier } from "@/types/trust";

const TIERS: Record<
  TrustTier,
  { label: string; className: string; icon: typeof Award }
> = {
  NEW: {
    label: "New freelancer",
    className: "bg-zinc-100 text-zinc-600",
    icon: Sparkles,
  },
  RISING: {
    label: "Rising",
    className: "bg-blue-50 text-blue-700",
    icon: TrendingUp,
  },
  TRUSTED: {
    label: "Trusted",
    className: "bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
  },
  TOP_RATED: {
    label: "Top rated",
    className: "bg-amber-50 text-amber-700",
    icon: Award,
  },
};

interface TrustBadgeProps {
  trust?: TrustScore | null;
}

export function TrustBadge({ trust }: TrustBadgeProps) {
  if (!trust) return null;

  const tier = TIERS[trust.tier];
  const Icon = tier.icon;

  return (
    <span
      title={
        trust.score === null
          ? "No completed projects yet, so there is no trust score."
          : `Trust score ${trust.score}/100, based on ${trust.completedProjects} completed project(s)`
      }
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tier.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {tier.label}
      {trust.score !== null && (
        <span className="font-semibold">{trust.score}</span>
      )}
    </span>
  );
}

/* One short line of evidence, shown under a freelancer's name. */
export function TrustFacts({ trust }: TrustBadgeProps) {
  if (!trust || trust.score === null) return null;

  const { facts } = trust;
  const parts: string[] = [`${trust.completedProjects} completed`];

  if (facts.onTimeEligible > 0) {
    parts.push(
      `${facts.onTimeDeliveries}/${facts.onTimeEligible} milestones on time`,
    );
  }

  parts.push(
    facts.disputesLost === 0
      ? "no lost disputes"
      : `${facts.disputesLost} lost dispute${facts.disputesLost > 1 ? "s" : ""}`,
  );

  if (facts.repeatClients > 0) {
    parts.push(
      `${facts.repeatClients} repeat client${facts.repeatClients > 1 ? "s" : ""}`,
    );
  }

  return <p className="mt-1 text-xs text-zinc-500">{parts.join(" · ")}</p>;
}

const ROWS: {
  key: keyof TrustScore["breakdown"];
  label: string;
  hint: string;
}[] = [
  { key: "reviews", label: "Client reviews", hint: "Average rating" },
  { key: "onTime", label: "On-time delivery", hint: "Milestones by due date" },
  { key: "disputes", label: "Dispute record", hint: "Disputes lost" },
  { key: "completion", label: "Completion", hint: "Finished vs cancelled" },
  { key: "repeatClients", label: "Repeat clients", hint: "Clients who rehired" },
];

/* Full explanation of the score, shown on the profile page. */
export function TrustBreakdown({ trust }: TrustBadgeProps) {
  if (!trust) return null;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Trust score</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Calculated from real project history. It cannot be edited or bought.
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold leading-none">
            {trust.score ?? "–"}
            {trust.score !== null && (
              <span className="text-sm font-medium text-zinc-400">/100</span>
            )}
          </p>
          <div className="mt-2">
            <TrustBadge trust={{ ...trust, score: null }} />
          </div>
        </div>
      </div>

      {trust.score === null ? (
        <p className="mt-4 text-sm text-zinc-500">
          This freelancer hasn't completed a project on the platform yet, so
          there is no history to score.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {ROWS.map(({ key, label, hint }) => {
            const value = trust.breakdown[key];

            return (
              <div key={key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-zinc-500">
                    {value === null ? "No data yet" : `${value}%`}
                  </span>
                </div>

                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-900"
                    style={{ width: `${value ?? 0}%` }}
                  />
                </div>

                <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
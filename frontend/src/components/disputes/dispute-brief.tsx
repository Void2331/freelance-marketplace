import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useGenerateDisputeBrief } from "@/hooks/use-disputes";
import { getErrorMessage } from "@/lib/errors";

import type { Dispute, DisputeBrief } from "@/types/dispute";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>

      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/* Facts come from the database, not the AI, so they are shown first. */
function FactsGrid({ brief }: { brief: DisputeBrief }) {
  const { facts } = brief;

  const lateText =
    facts.delivery.submittedLate === null
      ? "No due date"
      : facts.delivery.submittedLate
        ? `Late by ${facts.delivery.lateByDays} day(s)`
        : "On time";

  const rows: [string, string][] = [
    ["Opened by", `${facts.dispute.openedBy.toLowerCase()} · ${facts.dispute.daysOpen} day(s) ago`],
    ["Due date", formatDate(facts.milestone.dueDate)],
    ["Delivery", `${facts.delivery.submissionCount} submission(s) · ${lateText}`],
    ["Revisions asked", String(facts.delivery.revisionRequests)],
    [
      "Messages",
      `client ${facts.communication.clientMessages} · freelancer ${facts.communication.freelancerMessages}`,
    ],
    [
      "Other party replied since",
      facts.communication.otherPartyRepliedAfterDispute ? "Yes" : "No",
    ],
    ["Payment", facts.payment ? facts.payment.status.toLowerCase() : "none recorded"],
    [
      "Evidence",
      facts.evidence.count === 0
        ? "None attached"
        : facts.evidence.items.map((item) => `${item.name} (${item.host})`).join(", "),
    ],
  ];

  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 border-b border-dashed py-1">
          <dt className="text-zinc-500">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DisputeBriefPanel({ dispute }: { dispute: Dispute }) {
  const generate = useGenerateDisputeBrief();
  const brief = dispute.aiBrief;

  async function handleGenerate() {
    try {
      await generate.mutateAsync(dispute._id);
      toast.success("Case briefing ready");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to generate the briefing"));
    }
  }

  return (
    <div className="mt-4 rounded-xl border bg-zinc-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            AI case briefing
          </h4>

          {brief && (
            <p className="mt-0.5 text-xs text-zinc-400">
              Generated {new Date(brief.generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={generate.isPending}
        >
          {generate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {brief ? "Regenerate" : "Generate briefing"}
        </Button>
      </div>

      {!brief ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Summarises what each side says, where they agree and disagree, and
          what to ask next. It never recommends a decision.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <FactsGrid brief={brief} />

          <p className="text-sm leading-6 text-zinc-800">{brief.content.summary}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Client says
              </p>
              <p className="mt-1 text-sm text-zinc-700">{brief.content.clientPosition}</p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Freelancer says
              </p>
              <p className="mt-1 text-sm text-zinc-700">{brief.content.freelancerPosition}</p>
            </div>
          </div>

          <List title="Both sides appear to agree" items={brief.content.agreedFacts} />
          <List title="In dispute" items={brief.content.disputedPoints} />
          <List title="Evidence" items={brief.content.evidenceNotes} />
          <List title="Questions to ask before deciding" items={brief.content.questionsForAdmin} />
          <List title="Be careful" items={brief.content.cautions} />

          <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            AI-generated from what the parties wrote, so every claim is
            unverified. Check it against the evidence and messages. It does not
            recommend an outcome; the decision is yours.
          </p>
        </div>
      )}
    </div>
  );
}

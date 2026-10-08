import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useSuggestMilestonePlan } from "@/hooks/use-ai";
import { getErrorMessage } from "@/lib/errors";
import { planTotal } from "@/lib/milestone-plan";

import type { BudgetType, MilestonePlanItem } from "@/types/job";

interface MilestonePlanEditorProps {
  plan: MilestonePlanItem[];
  onChange: (plan: MilestonePlanItem[]) => void;

  // read from the job form so the AI has something to work with
  title: string;
  description: string;
  budget?: number;
  budgetType: BudgetType;
  deadline?: string;
}

export function MilestonePlanEditor({
  plan,
  onChange,
  title,
  description,
  budget,
  budgetType,
  deadline,
}: MilestonePlanEditorProps) {
  const suggest = useSuggestMilestonePlan();

  const hasBudget = typeof budget === "number" && budget > 0;
  const canSuggest =
    title.trim().length >= 5 && description.trim().length >= 20 && hasBudget;

  const total = planTotal(plan);
  const showAmounts = budgetType === "FIXED" && hasBudget;

  async function handleSuggest() {
    if (plan.length > 0) {
      const ok = window.confirm(
        "Replace your current milestones with a new AI suggestion?",
      );
      if (!ok) return;
    }

    try {
      const milestones = await suggest.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        budget: budget as number,
        deadline: deadline || undefined,
      });

      onChange(milestones);
      toast.success("Draft plan ready. Review and edit it before posting.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to generate a plan"));
    }
  }

  function updateItem(index: number, patch: Partial<MilestonePlanItem>) {
    onChange(plan.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(plan.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([
      ...plan,
      { title: "", description: "", percentage: Math.max(0, 100 - total) },
    ]);
  }

  return (
    <div className="rounded-xl border bg-zinc-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            Payment plan (optional)
          </h3>

          <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">
            Split the work into milestones so freelancers see how they will be
            paid. Money is only released when you approve each milestone. AI
            drafts it; you stay in control and can edit everything.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={!canSuggest || suggest.isPending}
        >
          {suggest.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {plan.length > 0 ? "Regenerate with AI" : "Suggest with AI"}
        </Button>
      </div>

      {!canSuggest && plan.length === 0 && (
        <p className="mt-3 text-xs text-zinc-400">
          Fill in the title, a description (20+ characters) and the budget to
          enable AI suggestions.
        </p>
      )}

      {plan.length > 0 && (
        <div className="mt-4 space-y-3">
          {plan.map((item, index) => (
            <div key={index} className="rounded-lg border bg-white p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={item.title}
                    maxLength={100}
                    placeholder="Milestone title"
                    onChange={(event) =>
                      updateItem(index, { title: event.target.value })
                    }
                  />

                  <Textarea
                    value={item.description}
                    maxLength={400}
                    placeholder="What will be delivered?"
                    className="min-h-16"
                    onChange={(event) =>
                      updateItem(index, { description: event.target.value })
                    }
                  />
                </div>

                <div className="w-24 shrink-0">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={Number.isFinite(item.percentage) ? item.percentage : ""}
                      onChange={(event) =>
                        updateItem(index, {
                          percentage: Math.round(Number(event.target.value)),
                        })
                      }
                    />
                    <span className="text-sm text-zinc-500">%</span>
                  </div>

                  {showAmounts && (
                    <p className="mt-1 text-xs text-zinc-500">
                      ₦{Math.round(((budget as number) * (item.percentage || 0)) / 100).toLocaleString()}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove milestone ${index + 1}`}
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add milestone
            </Button>

            <p
              className={`text-sm font-medium ${
                total === 100 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              Total: {total}%
              {total !== 100 &&
                (total < 100
                  ? ` (${100 - total}% left to assign)`
                  : ` (${total - 100}% over)`)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

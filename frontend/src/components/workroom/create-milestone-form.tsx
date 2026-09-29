import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateMilestone } from "@/hooks/use-milestones";
import {
  milestoneSchema,
  type MilestoneFormValues,
} from "@/lib/validations/milestone";
import { getErrorMessage } from "@/lib/errors";

interface CreateMilestoneFormProps {
  projectId: string;
  currency: string;
  remainingBudget: number;
}

export function CreateMilestoneForm({
  projectId,
  currency,
  remainingBudget,
}: CreateMilestoneFormProps) {
  const [open, setOpen] = useState(false);
  const createMilestone = useCreateMilestone();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
  });

  if (remainingBudget <= 0) {
    return (
      <p className="text-sm text-zinc-500">
        The full project budget is already allocated to milestones.
      </p>
    );
  }

  async function onSubmit(values: MilestoneFormValues) {
    if (values.amount > remainingBudget) {
      setError("amount", {
        message: `Only ${currency} ${remainingBudget.toLocaleString()} of the budget is left`,
      });
      return;
    }

    try {
      await createMilestone.mutateAsync({
        projectId,
        data: {
          ...values,
          // <input type="date"> gives YYYY-MM-DD; send a full ISO timestamp
          dueDate: new Date(`${values.dueDate}T23:59:59`).toISOString(),
        },
      });

      toast.success("Milestone added");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to add milestone"),
      );
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add milestone
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">New milestone</h3>
        <span className="text-xs text-zinc-500">
          Remaining budget: {currency} {remainingBudget.toLocaleString()}
        </span>
      </div>

      <div>
        <Input placeholder="Title" {...register("title")} />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="What should be delivered?"
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input
            type="number"
            min="1"
            placeholder={`Amount (${currency})`}
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-600">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <Input type="date" {...register("dueDate")} />
          {errors.dueDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={createMilestone.isPending}>
          {createMilestone.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Add milestone
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

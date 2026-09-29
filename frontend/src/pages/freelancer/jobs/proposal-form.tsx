import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Loader2,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Input,
} from "@/components/ui/input";

import {
  useCreateProposal,
} from "@/hooks/use-proposals";

import {
  proposalSchema,
  type ProposalFormValues,
} from "@/lib/validations/proposal";
import { getErrorMessage } from "@/lib/errors";

interface ProposalFormProps {
  jobId: string;
}

export function ProposalForm({
  jobId,
}: ProposalFormProps) {
  const navigate =
    useNavigate();

  const mutation =
    useCreateProposal();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<ProposalFormValues>({
    resolver:
      zodResolver(
        proposalSchema,
      ),
  });

  async function onSubmit(
    values: ProposalFormValues,
  ) {
    try {
      await mutation.mutateAsync({
        jobId,
        data: values,
      });

      toast.success(
        "Proposal submitted successfully",
      );

      navigate(
        "/freelancer/proposals",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to submit proposal"),
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border bg-white p-5 shadow-sm"
    >
      <div>
        <h2 className="font-semibold">
          Submit a Proposal
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Explain why you're the right freelancer for this project.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">
          Cover letter
        </label>

        <Textarea
          className="mt-2 min-h-40"
          placeholder="Introduce yourself and explain how you would approach this project..."
          {...register(
            "coverLetter",
          )}
        />

        {errors.coverLetter && (
          <p className="mt-1 text-xs text-red-600">
            {errors.coverLetter.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Your bid
          </label>

          <Input
            type="number"
            min="1"
            className="mt-2"
            placeholder="500000"
            {...register(
              "bidAmount",
              {
                valueAsNumber: true,
              },
            )}
          />

          {errors.bidAmount && (
            <p className="mt-1 text-xs text-red-600">
              {errors.bidAmount.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">
            Estimated duration
          </label>

          <Input
            type="number"
            min="1"
            className="mt-2"
            placeholder="14"
            {...register(
              "estimatedDuration",
              {
                valueAsNumber: true,
              },
            )}
          />

          {errors.estimatedDuration && (
            <p className="mt-1 text-xs text-red-600">
              {
                errors.estimatedDuration
                  .message
              }
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          mutation.isPending
        }
      >
        {mutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}

        Submit Proposal
      </Button>
    </form>
  );
}
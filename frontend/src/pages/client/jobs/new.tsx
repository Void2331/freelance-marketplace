import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  DashboardHeader,
} from "@/components/dashboard/dashboard-header";

import {
  useCreateJob,
  useJob,
  useUpdateJob,
} from "@/hooks/use-jobs";

import {
  jobSchema,
  type JobFormValues,
} from "@/lib/validations/job";
import { getErrorMessage } from "@/lib/errors";

export default function CreateJobPage() {
  const navigate = useNavigate();

  // Same form serves /client/jobs/new and /client/jobs/:id/edit.
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { data: existingJob } = useJob(id);
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const mutation = isEdit
    ? updateMutation
    : createMutation;

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<JobFormValues>({
    resolver:
      zodResolver(jobSchema),

    defaultValues: {
      title: "",
      description: "",
      category: "",
      skills: "",
      budgetType: "FIXED",
    },
  });

  useEffect(() => {
    if (!existingJob) return;

    reset({
      title: existingJob.title,
      description: existingJob.description,
      category: existingJob.category ?? "",
      skills: existingJob.skills.join(", "),
      budget: existingJob.budget,
      budgetType: existingJob.budgetType,
      deadline: existingJob.deadline
        ? existingJob.deadline.slice(0, 10)
        : undefined,
    });
  }, [existingJob, reset]);

  async function onSubmit(
    values: JobFormValues,
  ) {
    try {
      const payload = {
          title: values.title,
          description:
            values.description,
          category:
            values.category || undefined,

          skills: values.skills
            ? values.skills
                .split(",")
                .map((skill) =>
                  skill.trim(),
                )
                .filter(Boolean)
            : [],

          budget: values.budget,

          budgetType:
            values.budgetType,

          deadline:
            values.deadline
              ? new Date(
                  values.deadline,
                ).toISOString()
              : undefined,
      };

      const job = isEdit
        ? await updateMutation.mutateAsync({
            id: id!,
            data: payload,
          })
        : await createMutation.mutateAsync(
            payload,
          );

      toast.success(
        isEdit
          ? "Job updated"
          : "Job posted successfully",
      );

      navigate(
        `/client/jobs/${job._id}`,
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to post job"),
      );
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
        >
          <Link to="/client/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <DashboardHeader
        title={isEdit ? "Edit Job" : "Post a Job"}
        description={
          isEdit
            ? "Update the details of your job."
            : "Tell freelancers what you need built."
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="text-sm font-medium">
            Job title
          </label>

          <Input
            className="mt-2"
            placeholder="e.g. Build a React e-commerce application"
            {...register("title")}
          />

          {errors.title && (
            <p className="mt-1 text-xs text-red-600">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">
            Description
          </label>

          <Textarea
            className="mt-2 min-h-48"
            placeholder="Describe the project, requirements, deliverables and expectations..."
            {...register("description")}
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">
              Category
            </label>

            <Input
              className="mt-2"
              placeholder="Web Development"
              {...register("category")}
            />

            {errors.category && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Skills
            </label>

            <Input
              className="mt-2"
              placeholder="React, Node.js, MongoDB"
              {...register("skills")}
            />

            <p className="mt-1 text-xs text-zinc-500">
              Separate skills with commas.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">
              Budget
            </label>

            <Input
              type="number"
              min="1"
              className="mt-2"
              placeholder="500000"
              {...register(
                "budget",
                {
                  valueAsNumber: true,
                },
              )}
            />

            {errors.budget && (
              <p className="mt-1 text-xs text-red-600">
                {errors.budget.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Budget type
            </label>

            <Controller
              control={control}
              name="budgetType"
              render={({
                field,
              }) => (
                <select
                  {...field}
                  className="mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  <option value="FIXED">
                    Fixed price
                  </option>

                  <option value="HOURLY">
                    Hourly
                  </option>
                </select>
              )}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Deadline
          </label>

          <Input
            type="date"
            className="mt-2"
            {...register("deadline")}
          />

          {errors.deadline && (
            <p className="mt-1 text-xs text-red-600">
              {errors.deadline.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              navigate("/client/jobs")
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {isEdit ? "Save changes" : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/dashboard/section-card";

import { useCreateReview, useProjectReviews } from "@/hooks/use-reviews";
import { reviewSchema, type ReviewFormValues } from "@/lib/validations/review";

import type { AuthUser } from "@/types/auth";
import type { Review } from "@/types/review";
import { getErrorMessage } from "@/lib/errors";

interface ReviewPanelProps {
  projectId: string;
  currentUser: AuthUser | null;
}

const SUB_RATING_FIELDS = [
  { key: "communicationRating", label: "Communication" },
  { key: "qualityRating", label: "Quality of work" },
  { key: "deadlineRating", label: "Met deadlines" },
] as const;

function StarRating({
  value,
  onChange,
  size = "h-6 w-6",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: string;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <Star
            className={`${size} ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StaticStars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-zinc-300"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const reviewer = typeof review.reviewer === "string" ? null : review.reviewer;

  const subRatings = SUB_RATING_FIELDS.filter(
    (field) => typeof review[field.key] === "number",
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {reviewer?.name ?? "Project participant"}
        </p>

        <StaticStars value={review.rating} />
      </div>

      {subRatings.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3">
          {subRatings.map((field) => (
            <div key={field.key}>
              <p className="text-[11px] text-zinc-500">{field.label}</p>
              <StaticStars value={review[field.key] as number} />
            </div>
          ))}
        </div>
      )}

      {review.comment && (
        <p className="mt-3 text-sm text-zinc-600">{review.comment}</p>
      )}
    </div>
  );
}

export function ReviewPanel({ projectId, currentUser }: ReviewPanelProps) {
  const { data: reviews = [], isLoading } = useProjectReviews(projectId);
  const createReview = useCreateReview();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    // Sub-ratings default to undefined, not 0 — the schema requires
    // 1-5 *when present*, so a literal 0 here would fail validation
    // the moment the reviewer submits without touching one.
    defaultValues: {
      rating: 0,
      communicationRating: undefined,
      qualityRating: undefined,
      deadlineRating: undefined,
      comment: "",
    },
  });

  const rating = watch("rating");
  const comment = watch("comment");

  const myReview = reviews.find((review) => {
    const reviewer =
      typeof review.reviewer === "string" ? review.reviewer : review.reviewer._id;
    return reviewer === currentUser?._id;
  });

  async function onSubmit(values: ReviewFormValues) {
    try {
      await createReview.mutateAsync({
        projectId,
        data: values,
      });

      toast.success("Review submitted");
      reset({
        rating: 0,
        communicationRating: undefined,
        qualityRating: undefined,
        deadlineRating: undefined,
        comment: "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit review"));
    }
  }

  return (
    <SectionCard
      title="Reviews"
      description="Feedback shared between the client and freelancer"
    >
      {isLoading ? (
        <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}

          {!myReview && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 rounded-lg border border-dashed p-4"
            >
              <div>
                <p className="text-sm font-medium">Overall rating</p>

                <div className="mt-1.5">
                  <StarRating
                    value={rating ?? 0}
                    onChange={(value) =>
                      setValue("rating", value, { shouldValidate: true })
                    }
                  />
                </div>

                {errors.rating && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
                {SUB_RATING_FIELDS.map((field) => (
                  <div key={field.key}>
                    <p className="text-xs text-zinc-500">{field.label}</p>

                    <div className="mt-1.5">
                      <StarRating
                        size="h-4 w-4"
                        value={watch(field.key) ?? 0}
                        onChange={(value) =>
                          setValue(field.key, value, { shouldValidate: true })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Textarea
                placeholder="How did the project go?"
                value={comment ?? ""}
                onChange={(event) => setValue("comment", event.target.value)}
              />

              <Button
                type="submit"
                size="sm"
                disabled={createReview.isPending}
              >
                {createReview.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit review
              </Button>
            </form>
          )}
        </div>
      )}
    </SectionCard>
  );
}

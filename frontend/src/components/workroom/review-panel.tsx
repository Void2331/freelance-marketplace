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
import { getErrorMessage } from "@/lib/errors";

interface ReviewPanelProps {
  projectId: string;
  currentUser: AuthUser | null;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
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
            className={`h-6 w-6 ${
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
    defaultValues: { rating: 0, comment: "" },
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
      reset({ rating: 0, comment: "" });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to submit review"),
      );
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
          {reviews.map((review) => {
            const reviewer =
              typeof review.reviewer === "string" ? null : review.reviewer;

            return (
              <div key={review._id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {reviewer?.name ?? "Project participant"}
                  </p>

                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-2 text-sm text-zinc-600">
                    {review.comment}
                  </p>
                )}
              </div>
            );
          })}

          {!myReview && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 rounded-lg border border-dashed p-4"
            >
              <p className="text-sm font-medium">Leave a review</p>

              <StarRating
                value={rating ?? 0}
                onChange={(value) =>
                  setValue("rating", value, { shouldValidate: true })
                }
              />

              {errors.rating && (
                <p className="text-xs text-red-600">
                  {errors.rating.message}
                </p>
              )}

              <Textarea
                placeholder="How did the project go?"
                value={comment ?? ""}
                onChange={(event) =>
                  setValue("comment", event.target.value)
                }
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

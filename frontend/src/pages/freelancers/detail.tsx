import { useParams } from "react-router-dom";
import { Loader2, MapPin, Star, UserRound } from "lucide-react";

import { useUserProfile, useUserReviews } from "@/hooks/use-users";

function ReviewerName(reviewer: unknown) {
  if (reviewer && typeof reviewer === "object" && "name" in reviewer) {
    return (reviewer as { name: string }).name;
  }
  return "Project participant";
}

export default function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: freelancer, isLoading, isError } = useUserProfile(id);
  const { data: reviews = [] } = useUserReviews(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !freelancer) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border p-10 text-center">
          <h3 className="font-semibold">Freelancer not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white">
                  {freelancer.name?.charAt(0).toUpperCase() ?? (
                    <UserRound className="h-6 w-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {freelancer.name}
                  </h1>

                  {freelancer.location && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                      <MapPin className="h-4 w-4" />
                      {freelancer.location}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {(freelancer.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-zinc-400">
                      ({freelancer.reviewCount ?? 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {freelancer.bio && (
                <>
                  <h2 className="mt-6 font-semibold">About</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                    {freelancer.bio}
                  </p>
                </>
              )}

              {freelancer.skills && freelancer.skills.length > 0 && (
                <>
                  <h2 className="mt-6 font-semibold">Skills</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">
                Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-400">
                  No reviews yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {ReviewerName(review.reviewer)}
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
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Rate</h2>

              <p className="mt-2 text-2xl font-bold">
                {typeof freelancer.hourlyRate === "number"
                  ? `₦${freelancer.hourlyRate.toLocaleString()}/hr`
                  : "Not set"}
              </p>

              <p className="mt-4 text-xs text-zinc-500">
                To work with {freelancer.name?.split(" ")[0]}, post a job and
                invite them to submit a proposal, or wait for them to apply to
                one of your open jobs.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

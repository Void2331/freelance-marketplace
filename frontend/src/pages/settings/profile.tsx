import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

import { useAuth } from "@/features/auth/auth-context";
import { useUpdateMyProfile } from "@/hooks/use-users";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { getErrorMessage } from "@/lib/errors";

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const updateProfile = useUpdateMyProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      name: user?.name ?? "",
      avatar: user?.avatar ?? "",
      bio: user?.bio ?? "",
      location: user?.location ?? "",
      skills: user?.skills?.join(", ") ?? "",
      hourlyRate: user?.hourlyRate ?? undefined,
    },
  });

  /**
   * Keep the form synchronized with the authenticated user.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      name: user.name ?? "",
      avatar: user.avatar ?? "",
      bio: user.bio ?? "",
      location: user.location ?? "",
      skills: user.skills?.join(", ") ?? "",
      hourlyRate: user.hourlyRate ?? undefined,
    });
  }, [user, reset]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      const updated = await updateProfile.mutateAsync({
        name: values.name,
        avatar: values.avatar?.trim() || undefined,
        bio: values.bio?.trim() || undefined,
        location: values.location?.trim() || undefined,

        skills: values.skills
          ? values.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : undefined,

        hourlyRate:
          typeof values.hourlyRate === "number" &&
          Number.isFinite(values.hourlyRate)
            ? values.hourlyRate
            : undefined,
      });

      /**
       * Update the authenticated user immediately so
       * the navbar reflects the new information.
       */
      if (user) {
        updateUser({
          ...user,
          name: updated.name,
          avatar: updated.avatar,
        });
      }

      toast.success("Profile updated successfully");

      /**
       * Reset the form with the saved values so the form
       * represents the latest server state.
       */
      reset({
        name: updated.name ?? "",
        avatar: updated.avatar ?? "",
        bio: updated.bio ?? "",
        location: updated.location ?? "",
        skills: updated.skills?.join(", ") ?? "",
        hourlyRate: updated.hourlyRate ?? undefined,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to update profile"),
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Profile Settings"
        description="This is what clients and freelancers see about you."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>

          <Input
            id="name"
            className="mt-2"
            {...register("name")}
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Avatar */}
        <div>
          <Label htmlFor="avatar">Avatar URL</Label>

          <Input
            id="avatar"
            className="mt-2"
            placeholder="https://example.com/avatar.jpg"
            {...register("avatar")}
          />

          <p className="mt-1 text-sm text-zinc-500">
            Paste a link to an image. There&apos;s no file upload yet.
          </p>

          {errors.avatar && (
            <p className="mt-1 text-sm text-red-600">
              {errors.avatar.message}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Bio</Label>

          <Textarea
            id="bio"
            className="mt-2"
            placeholder="Tell people about your experience..."
            {...register("bio")}
          />

          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>

          <Input
            id="location"
            className="mt-2"
            placeholder="Lagos, Nigeria"
            {...register("location")}
          />

          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Freelancer fields */}
        {user?.role === "FREELANCER" && (
          <>
            {/* Skills */}
            <div>
              <Label htmlFor="skills">Skills</Label>

              <Input
                id="skills"
                className="mt-2"
                placeholder="React, Node.js, PostgreSQL"
                {...register("skills")}
              />

              <p className="mt-1 text-sm text-zinc-500">
                Separate skills with commas.
              </p>

              {errors.skills && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* Hourly rate */}
            <div>
              <Label htmlFor="hourlyRate">
                Hourly rate (₦)
              </Label>

              <Input
                id="hourlyRate"
                type="number"
                min="0"
                className="mt-2"
                {...register("hourlyRate", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />

              {errors.hourlyRate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.hourlyRate.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          {updateProfile.isPending
            ? "Saving..."
            : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
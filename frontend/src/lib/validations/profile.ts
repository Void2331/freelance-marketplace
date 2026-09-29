import { z } from "zod";

export const profileSchema = z.object({
  avatar: z
    .string()
    .trim()
    .max(1000, "Avatar URL cannot exceed 1000 characters")
    .optional(),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional(),

  location: z
    .string()
    .trim()
    .max(150, "Keep it under 150 characters")
    .optional(),

  skills: z.string().optional(),

  hourlyRate: z
    .number()
    .min(0, "Hourly rate cannot be negative")
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
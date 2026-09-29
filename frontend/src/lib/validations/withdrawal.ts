import { z } from "zod";

export const withdrawalAccountSchema = z.object({
  bankCode: z.string().trim().min(1, "Please select a bank"),
  bankName: z.string().trim().min(1, "Bank name is required"),
  accountNumber: z
    .string()
    .trim()
    .min(10, "Account number must be 10 digits")
    .max(10, "Account number must be 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
});

export const withdrawalRequestSchema = z.object({
  amount: z
    .number({ message: "Amount is required" })
    .positive("Withdrawal amount must be greater than zero"),
});

export type WithdrawalAccountFormValues = z.infer<
  typeof withdrawalAccountSchema
>;

export type WithdrawalRequestFormValues = z.infer<
  typeof withdrawalRequestSchema
>;

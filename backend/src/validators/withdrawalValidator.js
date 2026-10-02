const { z } = require("zod");

const setupWithdrawalAccountSchema = z.object({
  bankCode: z
    .string()
    .trim()
    .min(1, "Bank code is required"),

  bankName: z
    .string()
    .trim()
    .min(1, "Bank name is required"),

  accountNumber: z
    .string()
    .trim()
    .min(10, "Account number must be at least 10 digits")
    .max(10, "Account number cannot exceed 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
});

const requestWithdrawalSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Withdrawal amount must be greater than zero"),
});

module.exports = {
  setupWithdrawalAccountSchema,
  requestWithdrawalSchema,
};

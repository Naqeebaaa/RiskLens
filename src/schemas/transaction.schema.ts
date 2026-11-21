import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string().min(1),
  sourceAccountId: z.string().min(1),
  destinationAccountId: z.string().min(1),
amount: z.string()
  .regex(/^\d{1,18}(\.\d{1,2})?$/)
  .refine((value) => /[1-9]/.test(value), "Amount must be positive"),
  currency: z.string().regex(/^[A-Z]{3}$/),
  timestamp: z.string().datetime(),
  transactionType: z.enum(["TRANSFER", "CASH_DEPOSIT"]),
 locationId: z.string().min(1).optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
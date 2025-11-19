import z from "zod";

export const CreateLinkSchema = z.object({
  url: z.string().url("Invalid URL format"),
  customCode: z
    .string()
    .min(6, "Code must be at least 6 characters")
    .max(8, "Code must be at most 8 characters")
    .regex(/^[A-Za-z0-9]+$/, "Code can only contain letters and numbers")
    .optional(),
});

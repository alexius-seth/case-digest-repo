import { z } from "zod";
import {
  LEGAL_CLASSIFICATIONS,
  type LegalClassification,
} from "@/lib/constants";

export { LEGAL_CLASSIFICATIONS, type LegalClassification };

export const caseDigestSchema = z.object({
  case_title: z
    .string()
    .trim()
    .min(3, "Case title must be at least 3 characters."),
  gr_number: z
    .string()
    .trim()
    .min(3, "G.R. number or citation must be at least 3 characters."),
  legal_classification: z.enum(LEGAL_CLASSIFICATIONS, {
    message: "Please select a valid legal classification.",
  }),
  subcategory: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  doctrine: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  facts: z
    .string()
    .trim()
    .min(10, "Facts must be at least 10 characters."),
  issues: z
    .string()
    .trim()
    .min(5, "Issues must be at least 5 characters."),
  ruling: z
    .string()
    .trim()
    .min(10, "Ruling must be at least 10 characters."),
});

export type CaseDigestInput = z.infer<typeof caseDigestSchema>;

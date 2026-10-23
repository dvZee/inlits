import { z } from "zod";
const text = z.string().trim().min(1).max(2000);
const id = z.string().uuid();
export const commandSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("decision.accept"),
      job_id: id,
      selected: z.number().int().min(0).max(2),
    })
    .strict(),
  z
    .object({
      action: z.literal("fact.save"),
      id: id.optional(),
      label: text.max(100),
      value: text,
      kind: z.enum(["fact", "inference", "hypothesis"]),
      consent: z.literal(true),
    })
    .strict(),
  z.object({ action: z.literal("fact.delete"), id }).strict(),
  z
    .object({
      action: z.literal("assessment.save"),
      id: id.optional(),
      assessment: z.enum([
        "values",
        "thinking",
        "communication",
        "career",
        "money",
        "habits",
      ]),
      answers: z.array(z.number().int().min(1).max(5).nullable()).length(3),
      complete: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal("decision.save"),
      topic: text.max(200),
      options: z
        .array(z.object({ name: text.max(100), fit: text, tradeoff: text }))
        .min(2)
        .max(3),
      selected: z.number().int().min(0).max(2),
      reason: text,
      next_step: text,
      use_personal_context: z.boolean(),
    })
    .strict(),
  z
    .object({ action: z.literal("decision.outcome"), id, outcome: text })
    .strict(),
  z
    .object({
      action: z.literal("goal.create"),
      decision_id: id,
      business_id: id,
      share_context: z.literal(true),
    })
    .strict(),
  z
    .object({
      action: z.literal("business.create"),
      name: text.max(100),
      type: z.enum(["agency", "services", "ecommerce", "creator"]),
      goal: text,
    })
    .strict(),
  z.object({ action: z.literal("goal.cancel"), id }).strict(),
]);

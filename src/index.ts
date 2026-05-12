/**
 * Canonical Support Layer 1 contract types + zod schemas for the Rello ecosystem.
 *
 * Single source of truth for `POST /api/support/sync` request/response shapes.
 * Shared by Rello (canonical receiver) and all 10 spokes (callers). Importing
 * this package makes a contract drift a **compile error** in every consumer
 * instead of a silent 4xx at runtime.
 *
 * Sourcing: shape is lifted verbatim from `ANSWERS.md` Q3.1 lock body (Platform
 * Admin Build, 2026-05-12). Idempotency key is `(sourceApp, externalTicketId)`
 * composite on Rello's canonical `SupportTicket` model.
 *
 * Permission scope: callers MUST hold `support:write` (slug `SUPPORT_WRITE` from
 * `@rello-platform/permissions`). Auth: `Authorization: Bearer rello_<key>`.
 *
 * Q3.1 cross-link — auto-detection of `category` and `priority` happens ONCE on
 * Rello's side. Spokes MAY pass them as hints; Rello is authoritative.
 */

import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────

// Mirrors Rello's `enum TicketCategory` in `prisma/schema.prisma`.
// Rello's enum is authoritative; this package mirrors it.
export const TICKET_CATEGORIES = [
  "ACCOUNT",
  "LEADS",
  "TECHNICAL",
  "BILLING",
  "FEATURE",
  "OTHER",
] as const;

export const TicketCategorySchema = z.enum(TICKET_CATEGORIES);
export type TicketCategory = z.infer<typeof TicketCategorySchema>;

export const TICKET_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export const TicketPrioritySchema = z.enum(TICKET_PRIORITIES);
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

// Mirrors Rello's `enum TicketStatus`.
export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_USER",
  "WAITING_ON_THIRD_PARTY",
  "RESOLVED",
  "CLOSED",
] as const;

export const TicketStatusSchema = z.enum(TICKET_STATUSES);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

// ─── Attachment shape ───────────────────────────────────────────────────────

export const TicketAttachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string().min(1).max(512),
  mimeType: z.string().min(1).max(128),
  sizeBytes: z.number().int().nonnegative().max(50 * 1024 * 1024),
});
export type TicketAttachment = z.infer<typeof TicketAttachmentSchema>;

// ─── Request — POST /api/support/sync body ──────────────────────────────────
//
// Idempotency key: `(sourceApp, externalTicketId)` composite. Re-POSTing the
// same pair returns the same `relloTicketId` with `status: "UPDATED"`.
//
// Subject of ticket: exactly one of `leadId` or `userId` MUST be present.
// Validated via `.superRefine()` below.

export const SupportSyncRequestSchema = z
  .object({
    sourceApp: z
      .string()
      .min(1)
      .max(64)
      .describe(
        "Canonical platform slug of the spoke that originated the ticket. MUST match `@rello-platform/slugs` `APP_SLUGS`."
      ),
    externalTicketId: z
      .string()
      .min(1)
      .max(128)
      .describe("Spoke's local ticket ID. Combines with `sourceApp` for server-side idempotency."),
    externalTicketUrl: z.string().url().optional(),
    tenantId: z.string().min(1).max(128),

    subject: z.string().min(1).max(200),
    description: z.string().min(1).max(50_000),
    category: TicketCategorySchema.optional(),
    priority: TicketPrioritySchema.optional(),

    leadId: z.string().min(1).max(128).optional(),
    userId: z.string().min(1).max(128).optional(),

    attachments: z.array(TicketAttachmentSchema).max(20).optional(),
    metadata: z.record(z.unknown()).optional(),
    reporterEmail: z.string().email().optional(),
    reporterName: z.string().min(1).max(200).optional(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .superRefine((data, ctx) => {
    const hasLead = typeof data.leadId === "string" && data.leadId.length > 0;
    const hasUser = typeof data.userId === "string" && data.userId.length > 0;
    if (hasLead === hasUser) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one of `leadId` or `userId` must be provided",
        path: hasLead && hasUser ? ["userId"] : ["leadId"],
      });
    }
  });

export type SupportSyncRequest = z.infer<typeof SupportSyncRequestSchema>;

// ─── Response — POST /api/support/sync return ───────────────────────────────

export const SupportSyncResponseSchema = z.object({
  relloTicketId: z.string().min(1),
  ticketNumber: z.string().regex(/^RELLO-\d{6,}$/),
  status: z.enum(["CREATED", "UPDATED"]),
  url: z.string().url(),
});
export type SupportSyncResponse = z.infer<typeof SupportSyncResponseSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format the platform-global ticket number from the canonical sequence.
 * Rello mints these; spokes never derive them.
 */
export function formatTicketNumber(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`formatTicketNumber: sequence must be a positive integer (got ${sequence})`);
  }
  return `RELLO-${String(sequence).padStart(6, "0")}`;
}

/**
 * Idempotency key shape used as a composite unique constraint on
 * `SupportTicket(sourceApp, externalTicketId)` in Rello's Prisma schema.
 */
export interface SupportTicketIdempotencyKey {
  readonly sourceApp: string;
  readonly externalTicketId: string;
}

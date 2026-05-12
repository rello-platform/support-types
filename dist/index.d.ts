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
export declare const TICKET_CATEGORIES: readonly ["ACCOUNT", "LEADS", "TECHNICAL", "BILLING", "FEATURE", "OTHER"];
export declare const TicketCategorySchema: z.ZodEnum<["ACCOUNT", "LEADS", "TECHNICAL", "BILLING", "FEATURE", "OTHER"]>;
export type TicketCategory = z.infer<typeof TicketCategorySchema>;
export declare const TICKET_PRIORITIES: readonly ["LOW", "NORMAL", "HIGH", "URGENT"];
export declare const TicketPrioritySchema: z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>;
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;
export declare const TICKET_STATUSES: readonly ["OPEN", "IN_PROGRESS", "WAITING_ON_USER", "WAITING_ON_THIRD_PARTY", "RESOLVED", "CLOSED"];
export declare const TicketStatusSchema: z.ZodEnum<["OPEN", "IN_PROGRESS", "WAITING_ON_USER", "WAITING_ON_THIRD_PARTY", "RESOLVED", "CLOSED"]>;
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export declare const TicketAttachmentSchema: z.ZodObject<{
    url: z.ZodString;
    filename: z.ZodString;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    url: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
}, {
    url: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
}>;
export type TicketAttachment = z.infer<typeof TicketAttachmentSchema>;
export declare const SupportSyncRequestSchema: z.ZodEffects<z.ZodObject<{
    sourceApp: z.ZodString;
    externalTicketId: z.ZodString;
    externalTicketUrl: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    subject: z.ZodString;
    description: z.ZodString;
    category: z.ZodOptional<z.ZodEnum<["ACCOUNT", "LEADS", "TECHNICAL", "BILLING", "FEATURE", "OTHER"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    leadId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        filename: z.ZodString;
        mimeType: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
    }, {
        url: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    reporterEmail: z.ZodOptional<z.ZodString>;
    reporterName: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sourceApp: string;
    externalTicketId: string;
    tenantId: string;
    subject: string;
    description: string;
    createdAt: string;
    externalTicketUrl?: string | undefined;
    category?: "ACCOUNT" | "LEADS" | "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    leadId?: string | undefined;
    userId?: string | undefined;
    attachments?: {
        url: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
    }[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    reporterEmail?: string | undefined;
    reporterName?: string | undefined;
}, {
    sourceApp: string;
    externalTicketId: string;
    tenantId: string;
    subject: string;
    description: string;
    createdAt: string;
    externalTicketUrl?: string | undefined;
    category?: "ACCOUNT" | "LEADS" | "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    leadId?: string | undefined;
    userId?: string | undefined;
    attachments?: {
        url: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
    }[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    reporterEmail?: string | undefined;
    reporterName?: string | undefined;
}>, {
    sourceApp: string;
    externalTicketId: string;
    tenantId: string;
    subject: string;
    description: string;
    createdAt: string;
    externalTicketUrl?: string | undefined;
    category?: "ACCOUNT" | "LEADS" | "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    leadId?: string | undefined;
    userId?: string | undefined;
    attachments?: {
        url: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
    }[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    reporterEmail?: string | undefined;
    reporterName?: string | undefined;
}, {
    sourceApp: string;
    externalTicketId: string;
    tenantId: string;
    subject: string;
    description: string;
    createdAt: string;
    externalTicketUrl?: string | undefined;
    category?: "ACCOUNT" | "LEADS" | "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    leadId?: string | undefined;
    userId?: string | undefined;
    attachments?: {
        url: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
    }[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    reporterEmail?: string | undefined;
    reporterName?: string | undefined;
}>;
export type SupportSyncRequest = z.infer<typeof SupportSyncRequestSchema>;
export declare const SupportSyncResponseSchema: z.ZodObject<{
    relloTicketId: z.ZodString;
    ticketNumber: z.ZodString;
    status: z.ZodEnum<["CREATED", "UPDATED"]>;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "CREATED" | "UPDATED";
    url: string;
    relloTicketId: string;
    ticketNumber: string;
}, {
    status: "CREATED" | "UPDATED";
    url: string;
    relloTicketId: string;
    ticketNumber: string;
}>;
export type SupportSyncResponse = z.infer<typeof SupportSyncResponseSchema>;
/**
 * Format the platform-global ticket number from the canonical sequence.
 * Rello mints these; spokes never derive them.
 */
export declare function formatTicketNumber(sequence: number): string;
/**
 * Idempotency key shape used as a composite unique constraint on
 * `SupportTicket(sourceApp, externalTicketId)` in Rello's Prisma schema.
 */
export interface SupportTicketIdempotencyKey {
    readonly sourceApp: string;
    readonly externalTicketId: string;
}
//# sourceMappingURL=index.d.ts.map
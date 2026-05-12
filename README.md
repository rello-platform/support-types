# @rello-platform/support-types

Canonical Zod schemas + TypeScript types for the Rello platform Support Layer 1 contract. Shared by Rello (the canonical receiver at `POST /api/support/sync`) and every spoke that originates support tickets.

Importing this package makes a contract drift a **compile error** in every consumer, instead of a silent 4xx at runtime.

## Install

```bash
npm install "github:rello-platform/support-types#v0.1.0"
```

## Usage

### Spoke side — calling the receiver

```ts
import { SupportSyncRequestSchema, type SupportSyncRequest } from "@rello-platform/support-types";
import { SUPPORT_WRITE } from "@rello-platform/permissions";

const body: SupportSyncRequest = {
  sourceApp: "homeready",
  externalTicketId: localTicket.id,
  externalTicketUrl: `${process.env.HR_PUBLIC_URL}/admin/support/${localTicket.id}`,
  tenantId: localTicket.tenantId,
  subject: localTicket.subject,
  description: localTicket.body,
  leadId: localTicket.leadId,
  attachments: localTicket.attachments,
  metadata: { page: req.headers.referer },
  reporterEmail: req.user.email,
  reporterName: req.user.name,
  createdAt: localTicket.createdAt.toISOString(),
};

// Pre-flight validate before sending; surfaces shape errors as compile/runtime
// errors in your own surface instead of as 400s from Rello.
const parsed = SupportSyncRequestSchema.parse(body);

const res = await fetch(`${RELLO_API_URL}/api/support/sync`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HOMEREADY_TO_RELLO_API_KEY}`,
  },
  body: JSON.stringify(parsed),
});
```

### Rello side — the receiver

```ts
import { SupportSyncRequestSchema, formatTicketNumber } from "@rello-platform/support-types";

const parse = SupportSyncRequestSchema.safeParse(await req.json());
if (!parse.success) {
  return NextResponse.json({ error: "Invalid body", details: parse.error.flatten() }, { status: 400 });
}
```

## Idempotency

`(sourceApp, externalTicketId)` is the composite idempotency key on Rello's canonical `SupportTicket` model. Re-POSTing the same pair returns the same `relloTicketId` with `status: "UPDATED"`.

## Subject of ticket — exactly one of leadId or userId

`leadId` *or* `userId`. Validated server-side via `.superRefine()` on the schema. Tickets are either *about* a lead (customer-facing issue) or *from* a user (admin/agent issue). Both-or-neither rejected with 400.

## Permission scope

Callers MUST hold `support:write` (slug `SUPPORT_WRITE` from `@rello-platform/permissions`). The auth header is `Authorization: Bearer rello_<ApiKey>`.

## Provenance

- Spec: `ANSWERS.md` Q3.1 lock body, Platform Admin Build, 2026-05-12.
- Build dispatch: `PA-CLOSEOUT-SUPPORT-LAYER1-012`.

## Versioning

Semver. Minor bumps add fields backward-compatibly; major bumps rename / remove. Consumers pin to a tag (e.g. `#v0.1.0`).

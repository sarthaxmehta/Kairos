# Technical Architecture & System Design — Kairos Platform

## 1. System Vision & Paradigm

**Kairos** is engineered as a **Centralized Customer Flow Orchestration Engine**. Unlike conventional single-purpose queue counters or appointment scheduling plugins, Kairos serves as a unified state machine orchestrating interactions across multi-tenant client interfaces (Customer App, Staff App, Admin Dashboard) in real time.

---

## 2. Core Architectural Pillars

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT INTERFACES                                  │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────────┐   │
│   │    Customer App     │  │      Staff App      │  │    Admin Dashboard    │   │
│   └──────────┬──────────┘  └──────────┬──────────┘  └───────────┬───────────┘   │
└──────────────┼────────────────────────┼─────────────────────────┼───────────────┘
               │ (HTTPS REST / GraphQL) │                         │
               ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             API GATEWAY & AUTH LAYER                            │
│  - JWT Verification & Tenant Resolution                                         │
│  - Rate Limiting & Security Policies                                            │
│  - Role-Based Access Control (RBAC)                                             │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CENTRALIZED ORCHESTRATION BACKEND                          │
│   ┌───────────────────────────┐         ┌───────────────────────────────────┐   │
│   │ Queue & State Engine      │         │ Appointment Scheduler Engine      │   │
│   │ - Ticket Lifecycle State  │         │ - Slot Allocation & Locks         │   │
│   │ - Priority Queue Logic    │         │ - Rescheduling & Cancellation     │   │
│   └─────────────┬─────────────┘         └─────────────────┬─────────────────┘   │
│                 │                                         │                     │
│                 └────────────────────┬────────────────────┘                     │
│                                      ▼                                          │
│                         ┌───────────────────────────┐                           │
│                         │ Event Bus (Redis Pub/Sub) │                           │
│                         └────────────┬──────────────┘                           │
└──────────────────────────────────────┼──────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌─────────────────────────┐
│  Multi-Tenant Postgres│    │ Realtime Websockets  │    │  AI Operations Micro-   │
│  (Database + RLS)    │    │ (Socket.io/Pusher)   │    │  service (Python/Node)  │
└──────────────────────┘    └──────────────────────┘    └─────────────────────────┘
```

---

## 3. Multi-Tenancy Architecture

Kairos supports **Multi-Tenant SaaS isolation** with shared high-performance infrastructure:

### Multi-Tenancy Strategy: Hybrid Logical Partitioning (Row-Level Security)
1. **Tenant ID Scoping**: Every database entity includes a indexed `tenant_id` standard column.
2. **PostgreSQL Row-Level Security (RLS)**: Enforces hard boundary checks at the database query level. Even if a backend bug omits `WHERE tenant_id = X`, Postgres rejects unauthorized cross-tenant data leakage.
3. **Subdomain / Custom Domain Routing**:
   - Customer Portal: `https://{organization}.kairosflow.com` or custom domain `https://queue.hospitalname.com`
   - Staff/Admin Portals: Tenant contextual resolution via JWT claims & HTTP header `X-Tenant-ID`.

---

## 4. State Lifecycle & Ticket Transitions

The queue engine maintains a deterministic finite state machine (FSM) for every queue ticket token:

```
[ISSUED] ──► [WAITING] ──► [CALLED] ─────────► [IN_SERVICE] ──► [COMPLETED]
   │             │             │                     │
   ▼             ▼             ▼                     ▼
[CANCELLED]  [SKIPPED]     [NO_SHOW]             [TRANSFERRED]
```

### State Definitions:
- **`ISSUED`**: Ticket token created (Walk-in counter or online virtual queue entry).
- **`WAITING`**: Ticket active in department line waiting for an available counter call.
- **`CALLED`**: Staff pressed "Call Next". Customer notified via audio chime, TV display board, and push/SMS notification.
- **`IN_SERVICE`**: Customer arrived at counter; staff clicked "Start Service". Timer recording active service duration.
- **`COMPLETED`**: Service finalized; counter freed for next token. Feedback link sent to customer.
- **`SKIPPED` / `NO_SHOW`**: Customer did not arrive within grace period; token put on hold or moved to skip queue.
- **`TRANSFERRED`**: Customer redirected to another department counter without re-registering from scratch.

---

## 5. Real-Time Synchronization Pipeline

To guarantee sub-second updates across TV screens, staff screens, and customer mobile phones:

1. **Event Trigger**: Staff performs action (e.g. `callNextTicket(counter_id)`).
2. **Database Mutation**: Atomic transaction updates ticket status from `WAITING` to `CALLED`, sets `called_at = NOW()`, updates counter state.
3. **Pub/Sub Dispatch**: Backend publishes event payload `TICKET_CALLED` to Redis channel `tenant:{tenant_id}:branch:{branch_id}`.
4. **WebSocket Push**: WebSocket gateway broadcasts event to:
   - TV Display Board connected to branch/department stream.
   - Staff App active queue list.
   - Customer's active tracking screen (Targeted event for specific `ticket_id`).

---

## 6. Security, Resilience & Scalability

- **High Availability Redis Cluster**: Handles queue ticket locks to prevent race conditions (e.g. two staff calling the same customer simultaneously).
- **Rate Limiting**: Protects walk-in token API and appointment booking endpoints against bot attacks.
- **Audit Logging**: Every action (ticket skipped, priority overridden, staff break taken) is written to append-only audit tables.

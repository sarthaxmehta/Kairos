# Database Schema & Data Model — Kairos Platform

## 1. Overview

The Kairos database model is designed for PostgreSQL with **Row-Level Security (RLS)**, ensuring strict multi-tenant isolation, real-time query speed, and audit transparency.

---

## 2. Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     Tenants     │
└────────┬────────┘
         │ 1:N
         ├───────────────────────────────┐
         ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│     Users       │             │    Branches     │
└────────┬────────┘             └────────┬────────┘
         │                               │ 1:N
         │ 1:N                           ▼
         │                      ┌─────────────────┐
         │                      │   Departments   │
         │                      └────────┬────────┘
         │                               │ 1:N
         │                               ├────────────────────────┐
         ▼                               ▼                        ▼
┌─────────────────┐             ┌─────────────────┐      ┌─────────────────┐
│    Staff        │             │    Services     │      │    Counters     │
└────────┬────────┘             └────────┬────────┘      └────────┬────────┘
         │ 1:N                           │ 1:N                    │ 1:N
         ▼                               ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             QueueTokens / Appointments                   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │   ServiceLogs   │
                            └─────────────────┘
```

---

## 3. Core Tables Specification

### 3.1 Organization & Multi-Tenancy

#### `tenants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Unique tenant identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Organization name (e.g. City Hospital) |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | Subdomain identifier (e.g. `city-hospital`) |
| `industry_type`| `VARCHAR(50)` | NOT NULL | Vertical (Healthcare, Govt, Banking, Retail) |
| `settings` | `JSONB` | DEFAULT '{}' | Custom branding, notification channels, SLA thresholds |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Timestamp of creation |

#### `branches`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Branch identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant ownership key |
| `name` | `VARCHAR(255)` | NOT NULL | Branch name (e.g. Downtown Clinic) |
| `address` | `TEXT` | NOT NULL | Physical address |
| `timezone` | `VARCHAR(50)` | DEFAULT 'UTC' | Operating time zone |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Branch status toggle |

#### `departments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Department identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant scoping |
| `branch_id` | `UUID` | REFERENCES branches(id) | Associated branch |
| `name` | `VARCHAR(255)` | NOT NULL | Department name (e.g. Radiology) |
| `prefix` | `VARCHAR(10)` | NOT NULL | Ticket prefix code (e.g. `RAD`, `CAR`) |

---

### 3.2 Services & Counters Configuration

#### `services`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Service identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant scoping |
| `department_id`| `UUID` | REFERENCES departments(id)| Parent department |
| `name` | `VARCHAR(255)` | NOT NULL | Service title (e.g. Blood Test) |
| `avg_duration_min`| `INT` | DEFAULT 15 | Estimated standard service time |
| `max_daily_tokens`| `INT` | DEFAULT NULL | Cap on virtual queue capacity |

#### `counters`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Counter identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant scoping |
| `department_id`| `UUID` | REFERENCES departments(id)| Department allocation |
| `counter_number`| `VARCHAR(20)`| NOT NULL | Display label (e.g. "Counter 4", "Desk B") |
| `status` | `VARCHAR(30)` | DEFAULT 'OFFLINE' | Status (`OFFLINE`, `ACTIVE`, `ON_BREAK`) |
| `current_staff_id`| `UUID` | REFERENCES staff(id) | Currently logged-in operator |

---

### 3.3 Users & Staff Workload

#### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | User identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant ownership |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Account email |
| `password_hash`| `VARCHAR(255)` | NOT NULL | Encrypted credential |
| `full_name` | `VARCHAR(255)` | NOT NULL | Display name |
| `role` | `VARCHAR(50)` | NOT NULL | Role (`TENANT_ADMIN`, `BRANCH_MANAGER`, `STAFF`, `CUSTOMER`) |

#### `staff`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Staff identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant ownership |
| `user_id` | `UUID` | REFERENCES users(id) | Associated user account |
| `branch_id` | `UUID` | REFERENCES branches(id) | Primary branch assignment |
| `department_id`| `UUID` | REFERENCES departments(id)| Department assignment |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Active employee status |

---

### 3.4 Queue Tokens & Appointments Core State

#### `queue_tokens`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Token identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant ownership |
| `branch_id` | `UUID` | REFERENCES branches(id) | Location |
| `department_id`| `UUID` | REFERENCES departments(id)| Target department |
| `service_id` | `UUID` | REFERENCES services(id) | Selected service |
| `customer_id` | `UUID` | REFERENCES users(id) | Customer reference (if registered) |
| `customer_phone`| `VARCHAR(30)`| NULLABLE | Guest phone number |
| `token_number` | `VARCHAR(20)`| NOT NULL | Display token (e.g. `RAD-042`) |
| `status` | `VARCHAR(30)` | NOT NULL | State (`ISSUED`, `WAITING`, `CALLED`, `IN_SERVICE`, `COMPLETED`, `SKIPPED`, `NO_SHOW`, `CANCELLED`) |
| `priority` | `INT` | DEFAULT 0 | Priority level (0=Normal, 100=Emergency/VIP) |
| `counter_id` | `UUID` | REFERENCES counters(id) | Assigned counter upon call |
| `called_at` | `TIMESTAMPTZ` | NULLABLE | Timestamp when counter called customer |
| `service_start_at`| `TIMESTAMPTZ`| NULLABLE | Timestamp when service commenced |
| `service_end_at` | `TIMESTAMPTZ`| NULLABLE | Timestamp when service completed |
| `estimated_wait_min`| `INT` | DEFAULT 0 | AI calculated wait time prediction |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Token issue time |

#### `appointments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Appointment identifier |
| `tenant_id` | `UUID` | REFERENCES tenants(id) | Tenant ownership |
| `branch_id` | `UUID` | REFERENCES branches(id) | Target branch |
| `service_id` | `UUID` | REFERENCES services(id) | Booked service |
| `customer_id` | `UUID` | REFERENCES users(id) | Customer reference |
| `appointment_date`| `DATE` | NOT NULL | Scheduled calendar date |
| `start_time` | `TIME` | NOT NULL | Scheduled start time slot |
| `end_time` | `TIME` | NOT NULL | Scheduled end time slot |
| `status` | `VARCHAR(30)` | DEFAULT 'CONFIRMED' | Status (`CONFIRMED`, `CHECKED_IN`, `CANCELLED`, `RESCHEDULED`) |

---

## 4. Database Indexing & Performance Optimization

To maintain sub-50ms query response times under high concurrency:

```sql
-- Fast lookup for active queues by department & status
CREATE INDEX idx_queue_tokens_dept_status ON queue_tokens(tenant_id, department_id, status, priority DESC, created_at ASC);

-- Customer live tracking index
CREATE INDEX idx_queue_tokens_customer ON queue_tokens(tenant_id, customer_id, status);

-- Daily branch analytics index
CREATE INDEX idx_queue_tokens_analytics ON queue_tokens(tenant_id, branch_id, created_at);

-- Appointment slot lookup index
CREATE INDEX idx_appointments_slot ON appointments(tenant_id, branch_id, appointment_date, start_time);
```

# Kairos — AI-Powered Customer Flow & Operations Platform

> **Vision**: Transform appointment and queue management into an intelligent, end-to-end Customer Flow Operating System for healthcare, government, finance, retail, education, and enterprise organizations.

---

## 📌 Executive Summary

**Kairos** is a multi-tenant, AI-native Customer Flow & Operations SaaS platform. It acts as a centralized orchestration engine managing the entire customer journey from pre-service booking and real-time virtual queuing to staff service counter delivery, operational analytics, and AI-driven workflow optimization.

---

## 🏛 Platform Architecture Overview

```
                          ┌───────────────────────────┐
                          │    Customer Web / PWA     │
                          └─────────────┬─────────────┘
                                        │ (HTTP / WS)
                                        ▼
┌─────────────────────────┐   ┌───────────────────┐   ┌──────────────────────────┐
│     Staff App           ├──►│ Centralized       │◄──┤     Admin Dashboard      │
│ (Call/Skip/Complete)    │   │ Orchestration     │   │ (Config/Branch/Analytics)│
└─────────────────────────┘   │ Backend Engine    │   └──────────────────────────┘
                              └─────────┬─────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌─────────────────────┐      ┌────────────────────┐      ┌──────────────────────┐
│ Real-Time Engine    │      │ Multi-Tenant DB    │      │ AI Operations Layer  │
│ (WebSockets/Redis)  │      │ (PostgreSQL + RLS) │      │ (Predictive & Assistant)
└─────────────────────┘      └────────────────────┘      └──────────────────────┘
```

---

## 🚀 Key Applications

### 1. 📱 Customer Application (`apps/customer`)
- **Virtual Queuing & Ticket Tokening**: Join physical or virtual queues remotely; receive live digital queue position tickets.
- **Smart Appointment Booking**: Browse available slots, schedule visits, request rescheduling, or cancel.
- **Live Waiting Status & Tracker**: Dynamic estimated wait time updates, active queue progress visualization, and counter call notifications.
- **Service History & Feedback**: View past tokens, submit instant post-service ratings and detailed feedback.
- **Multi-channel Alerts**: WhatsApp, SMS, Email, and Push Notifications for queue position alerts and appointment reminders.

### 2. ⚡ Staff Application (`apps/staff`)
- **Counter Operations**: Single-click "Call Next Customer", "Recall Ticket", "Transfer Ticket to Department", or "Complete Service".
- **Queue Control & Reordering**: Skip absent customers, pause queue, or handle emergency/vip priority walk-ins.
- **Real-time Queue Overview**: Live line size visualizer, estimated processing speeds, and counter status toggles (Active, On Break, Offline).
- **Daily Workload Metrics**: Service time tracking per token, throughput performance, and upcoming scheduled appointments.

### 3. 📊 Admin Dashboard (`apps/admin`)
- **Multi-Branch & Multi-Department Hierarchy**: Configure multiple physical locations, departments, service lines, and individual counters.
- **Workflow & Service Builder**: Set operating hours, max queue capacities, average service durations, and custom forms.
- **Staff & Permission Management**: Role-Based Access Control (RBAC) across Tenant Admins, Branch Managers, Department Heads, and Counter Operators.
- **Real-time Operations Monitor**: Live heatmap of branch activity, active counter statuses, bottlenecks, and wait times.
- **Operational Analytics & Reporting**: Historical wait times, peak traffic hours, staff utilization rates, customer satisfaction (CSAT), and exportable SLA compliance reports.

---

## 🤖 AI Operational Intelligence Layer

1. **Predictive Wait Time Engine**: Evaluates live ticket velocities, historic day/hour traffic patterns, active staff counts, and service complexity to yield accurate wait times.
2. **Intelligent Scheduling & Slot Allocation**: Automatically recommends optimal appointment slots to smooth out peak demand spikes.
3. **Operational Bottleneck Detector**: Alerts administrators when wait times exceed thresholds or counter throughput drops below target SLAs.
4. **Natural Language AI Assistant**: Enables conversational queries for customers (*"Book earliest appointment with Dr. Smith"*) and admins (*"Which branch is most congested right now?"*).

---

## 📁 Repository Structure

```
Kairos/
├── apps/
│   ├── admin/             # Next.js Admin & Analytics Dashboard
│   ├── customer/          # Next.js Customer Booking & Live Queue App
│   └── staff/             # Next.js Staff Counter Operations App
├── packages/
│   ├── ai/                # AI Engine (Prediction algorithms, LLM integrations)
│   ├── db/                # Prisma/Drizzle Database Schema & Shared Client
│   └── core/              # Shared Types, Utils, Constants & Validators
├── docs/
│   ├── architecture.md    # Technical System Architecture & Real-Time Flow
│   ├── database-schema.md # Relational Schema, Entities, Indexes & RLS
│   ├── api-spec.md        # REST & WebSocket API Specification
│   └── ai-layer.md        # AI Engine & Predictive Algorithms Specification
├── docker-compose.yml     # Local Postgres, Redis, and Dev tools setup
├── package.json           # Monorepo Workspace Configuration
├── tsconfig.json          # Master TypeScript Config
└── README.md              # Project Master Overview
```

---

## 🛠 Tech Stack & Tooling

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router), React, TypeScript |
| **Styling** | Vanilla CSS / CSS Modules with modern CSS Variables & Glassmorphism design tokens |
| **Database** | PostgreSQL (with Row-Level Security for multi-tenancy) |
| **ORM / Query Builder** | Prisma / Drizzle ORM |
| **Cache & Real-time PubSub** | Redis (BullMQ for async jobs, WebSockets for live sync) |
| **AI / Machine Learning** | Python / Node.js AI microservice integration, OpenAI / Gemini SDKs |
| **Authentication** | NextAuth.js / Supabase Auth with JWT & RBAC |

---

## 🚦 Getting Started (Development Setup)

### Prerequisites
- Node.js >= 20.x
- npm or pnpm >= 9.x
- Docker & Docker Compose

### 1. Clone repository & install dependencies
```bash
git clone https://github.com/your-org/kairos.git
cd Kairos
npm install
```

### 2. Launch Local Database & Cache Infrastructure
```bash
docker-compose up -d
```

### 3. Initialize Environment Variables
```bash
cp .env.example .env
```

### 4. Run Shared Database Migrations
```bash
npm run db:migrate
```

### 5. Launch Development Servers
```bash
npm run dev
```

The apps will be available at:
- **Customer App**: `http://localhost:3000`
- **Staff App**: `http://localhost:3001`
- **Admin Dashboard**: `http://localhost:3002`

---

## 📄 Documentation

For deep technical details, check out the documentation files:
- 🏗 [Architecture & System Design](docs/architecture.md)
- 🗄 [Database Schema & Data Model](docs/database-schema.md)
- 📡 [API Specification & Real-time Events](docs/api-spec.md)
- 🧠 [AI Layer Architecture](docs/ai-layer.md)

---

## 📜 License
Internal / Proprietary Enterprise SaaS Platform. All rights reserved.

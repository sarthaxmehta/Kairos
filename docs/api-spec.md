# API & Real-Time Protocol Specification — Kairos Platform

## 1. Overview

Kairos exposes a RESTful HTTP API paired with a WebSocket Real-Time Gateway.
All HTTP endpoints are prefixed with `/api/v1` and require header `X-Tenant-ID` or a valid Bearer JWT token.

---

## 2. Customer Application APIs

### 2.1 Appointments & Queuing
- `POST /api/v1/customer/appointments/book`
  - **Body**: `{ "branch_id": "...", "service_id": "...", "date": "2026-08-01", "time_slot": "10:30" }`
  - **Response**: `201 Created` with appointment payload and QR code payload.

- `POST /api/v1/customer/queue/join`
  - **Body**: `{ "branch_id": "...", "service_id": "...", "phone": "+1234567890" }`
  - **Response**: `{ "token_id": "...", "token_number": "RAD-042", "estimated_wait_min": 18, "position_in_line": 4 }`

- `GET /api/v1/customer/queue/live-status/:tokenId`
  - **Response**: `{ "token_number": "RAD-042", "status": "WAITING", "position": 2, "estimated_wait_min": 12, "current_serving_token": "RAD-040", "counter": null }`

- `POST /api/v1/customer/feedback`
  - **Body**: `{ "token_id": "...", "rating": 5, "comments": "Excellent service at Counter 3" }`

---

## 3. Staff Counter Application APIs

### 3.1 Counter Operations
- `POST /api/v1/staff/counter/session/start`
  - **Body**: `{ "counter_id": "..." }`
  - **Response**: Counter status updated to `ACTIVE`.

- `POST /api/v1/staff/queue/call-next`
  - **Body**: `{ "counter_id": "...", "department_id": "..." }`
  - **Response**: `{ "called_token": { "id": "...", "token_number": "RAD-042", "customer_name": "John Doe", "service": "X-Ray" } }`

- `POST /api/v1/staff/queue/start-service`
  - **Body**: `{ "token_id": "..." }`
  - **Response**: Token status updated to `IN_SERVICE`.

- `POST /api/v1/staff/queue/complete-service`
  - **Body**: `{ "token_id": "...", "service_notes": "Completed successfully" }`
  - **Response**: Token status updated to `COMPLETED`, frees counter.

- `POST /api/v1/staff/queue/skip-customer`
  - **Body**: `{ "token_id": "...", "reason": "NO_SHOW" }`
  - **Response**: Moves token to `SKIPPED` state.

- `POST /api/v1/staff/queue/transfer`
  - **Body**: `{ "token_id": "...", "target_department_id": "..." }`
  - **Response**: Token re-queued in target department with retained priority.

---

## 4. Admin Dashboard APIs

### 4.1 Branch & Workflow Configuration
- `GET /api/v1/admin/branches`
  - **Response**: Array of configured organization branches with current active queue sizes.

- `POST /api/v1/admin/services`
  - **Body**: `{ "department_id": "...", "name": "Dental Checkup", "avg_duration_min": 20 }`

- `GET /api/v1/admin/analytics/realtime`
  - **Response**: `{ "total_waiting": 142, "avg_wait_min": 14.5, "active_counters": 18, "bottleneck_departments": ["Radiology", "Pharmacy"] }`

- `GET /api/v1/admin/analytics/reports`
  - **Query Params**: `?branch_id=...&from=2026-07-01&to=2026-07-28`
  - **Response**: Aggregated staff throughput, CSAT ratings, peak volume heatmaps, SLA compliance percentages.

---

## 5. WebSocket Real-Time Event Protocol

WebSocket Server Endpoint: `wss://ws.kairosflow.com/v1`

### Connection Handshake
Client authenticates sending JWT token via socket query or initial message:
```json
{
  "action": "subscribe",
  "topic": "tenant:hospital-a:branch:downtown:dept:radiology"
}
```

### Server Event Payloads

#### `QUEUE_UPDATED` (Broadcast to Staff & Public TV Display)
```json
{
  "event": "QUEUE_UPDATED",
  "timestamp": "2026-07-28T21:49:17Z",
  "data": {
    "department_id": "dept-123",
    "waiting_count": 12,
    "last_called_token": "RAD-042",
    "last_called_counter": "Counter 3"
  }
}
```

#### `TICKET_STATUS_CHANGED` (Unicast to Customer Mobile App)
```json
{
  "event": "TICKET_STATUS_CHANGED",
  "timestamp": "2026-07-28T21:49:17Z",
  "data": {
    "token_id": "tok-999",
    "token_number": "RAD-042",
    "status": "CALLED",
    "counter_number": "Counter 3",
    "staff_name": "Sarah Connor",
    "message": "Please proceed to Counter 3 immediately."
  }
}
```

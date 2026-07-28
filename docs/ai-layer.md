# AI Operational Intelligence Layer — Kairos Platform

## 1. Overview & Vision

The **Kairos AI Layer** transforms the platform from a conventional static queue scheduler into an **Adaptive Operational Intelligence Engine**. It operates continuously across four core capabilities:

1. **Predictive Queue Management**
2. **Intelligent Scheduling & Dynamic Slot Allocation**
3. **Operational Bottleneck & SLA Analytics**
4. **Conversational Natural Language Assistant**

---

## 2. Capability 1: Predictive Waiting Time Engine

Static queues estimate wait time simple multiplication: `Wait = Position * Avg Duration`.
This often fails due to staff breaks, complex cases, walk-in surges, and non-linear queue priorities.

Kairos uses a dynamic multi-factor prediction model:

$$\hat{T}_{\text{wait}} = \sum_{k=1}^{N_{\text{ahead}}} \frac{D_k \cdot (1 + \beta_{\text{cx}})}{\text{ActiveCounters}(t)} + \Delta_{\text{transfer}} - \Delta_{\text{velocity}}$$

### Feature Inputs:
- **Historical Traffic Velocity**: Time-of-day, day-of-week, season/holiday traffic curves.
- **Active Counter Concurrency**: Number of currently operational counters in `ACTIVE` state.
- **Customer Complexity Coefficient ($\beta_{\text{cx}}$)**: Service category difficulty (e.g. general inquiry = 1.0 vs complex diagnostic = 1.6).
- **Staff Velocity Vector**: Historical average service time per active counter staff member.
- **Queue Priority Mix**: Ratio of VIP/Emergency overrides currently queued ahead.

---

## 3. Capability 2: Intelligent Scheduling Engine

- **Peak Demand Smoothing**: Recommends appointment slots during historical lull periods (e.g. 11:15 AM or 3:30 PM) with small incentivized priority boosts.
- **Dynamic Slot Re-allocation**: Automatically expands or contracts online appointment booking caps based on live walk-in volume.
- **Smart Rescheduling**: If a branch experiences unexpected staff absence, Kairos automatically suggests alternative optimal slots or nearby sister branches.

---

## 4. Capability 3: Operational Analytics & Bottleneck Detection

An automated anomaly detection daemon evaluates operational logs every 60 seconds:

```
[Live Queue Stream] ──► [Anomaly Detector] ──► Trigger Threshold alert? 
                                                      │
                                                      ├── YES ──► Alert Branch Manager
                                                      │           Recommend Re-assigning
                                                      │           Staff from Counter B -> Counter A
                                                      │
                                                      └── NO ───► Continue Monitoring
```

- **SLA Breach Alerting**: Notifies managers when estimated wait time exceeds the configured 20-minute SLA threshold.
- **Staff Utilization Matrix**: Identifies underutilized departments and overloaded counters for real-time staff re-allocation.

---

## 5. Capability 4: Conversational AI Assistant Architecture

The **Kairos Assistant** provides natural language interfaces for both Customers and Admin Staff.

### System Architecture
```
[User Query] ──► [LLM Agent (Gemini/OpenAI)] ──► [Intent Classifier & Function Calling]
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │ Kairos Tool API │
                                                    └────────┬────────┘
                                                             │
                                                             ▼
[User Output] ◄── [Structured Response Generator] ◄── [Backend Data Exec]
```

### Supported Function Calling Tools Schema

```typescript
// AI Assistant Tool Declarations
export const aiTools = [
  {
    name: "book_earliest_appointment",
    description: "Finds and reserves the earliest available slot for a customer",
    parameters: {
      type: "object",
      properties: {
        department_id: { type: "string" },
        preferred_time: { type: "string", enum: ["MORNING", "AFTERNOON", "ANY"] }
      },
      required: ["department_id"]
    }
  },
  {
    name: "get_busiest_department",
    description: "Returns real-time queue congestion metrics across branch departments",
    parameters: {
      type: "object",
      properties: {
        branch_id: { type: "string" }
      },
      required: ["branch_id"]
    }
  },
  {
    name: "predict_expected_volume",
    description: "Generates expected customer arrival forecasts for a specific time window",
    parameters: {
      type: "object",
      properties: {
        branch_id: { type: "string" },
        target_time: { type: "string" }
      },
      required: ["branch_id", "target_time"]
    }
  }
];
```

### Conversation Examples:
- **Customer Query**: *"Can you book me the earliest appointment for radiology tomorrow morning?"*
  - **AI Action**: Calls `book_earliest_appointment(department_id="radiology", preferred_time="MORNING")` -> Returns 9:15 AM slot.
- **Admin Query**: *"Show today's busiest department and expected arrivals after 3 PM."*
  - **AI Action**: Calls `get_busiest_department()` + `predict_expected_volume(target_time="15:00")` -> Returns visual summary card.

/**
 * Kairos Database Schema Constants & Table Mapping
 */

export const TABLES = {
  TENANTS: 'tenants',
  BRANCHES: 'branches',
  DEPARTMENTS: 'departments',
  SERVICES: 'services',
  COUNTERS: 'counters',
  USERS: 'users',
  STAFF: 'staff',
  QUEUE_TOKENS: 'queue_tokens',
  APPOINTMENTS: 'appointments',
  SERVICE_LOGS: 'service_logs',
  FEEDBACK: 'feedback',
  AI_METRICS: 'ai_metrics',
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];

/**
 * Kairos Core Shared Types & Enums
 */

export enum TicketStatus {
  ISSUED = 'ISSUED',
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_SERVICE = 'IN_SERVICE',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum CounterStatus {
  OFFLINE = 'OFFLINE',
  ACTIVE = 'ACTIVE',
  ON_BREAK = 'ON_BREAK',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export interface QueueToken {
  id: string;
  tenantId: string;
  branchId: string;
  departmentId: string;
  serviceId: string;
  customerId?: string;
  tokenNumber: string;
  status: TicketStatus;
  priority: number;
  counterId?: string;
  calledAt?: Date;
  serviceStartAt?: Date;
  serviceEndAt?: Date;
  estimatedWaitMin: number;
  createdAt: Date;
}

export interface RealtimeQueueUpdate {
  departmentId: string;
  waitingCount: number;
  lastCalledToken: string | null;
  lastCalledCounter: string | null;
  timestamp: string;
}

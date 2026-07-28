/**
 * Kairos Database Client Entry Point
 */

export interface DatabaseClient {
  isConnected: boolean;
  tenantId?: string;
}

export function createDatabaseClient(tenantId?: string): DatabaseClient {
  return {
    isConnected: true,
    tenantId,
  };
}

export * from './schema';

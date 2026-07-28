/**
 * Kairos Natural Language AI Assistant Tool Declarations
 */

export interface AssistantTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const KAIROS_ASSISTANT_TOOLS: AssistantTool[] = [
  {
    name: 'book_earliest_appointment',
    description: 'Finds and reserves the earliest available slot for a customer',
    parameters: {
      type: 'object',
      properties: {
        departmentId: { type: 'string', description: 'Target department ID' },
        preferredTime: { type: 'string', enum: ['MORNING', 'AFTERNOON', 'ANY'] },
      },
      required: ['departmentId'],
    },
  },
  {
    name: 'get_busiest_department',
    description: 'Returns real-time queue congestion metrics across branch departments',
    parameters: {
      type: 'object',
      properties: {
        branchId: { type: 'string', description: 'Target branch ID' },
      },
      required: ['branchId'],
    },
  },
  {
    name: 'predict_expected_volume',
    description: 'Generates expected customer arrival forecasts for a specific time window',
    parameters: {
      type: 'object',
      properties: {
        branchId: { type: 'string', description: 'Branch identifier' },
        targetTime: { type: 'string', description: 'Target ISO time or HH:MM string' },
      },
      required: ['branchId', 'targetTime'],
    },
  },
];

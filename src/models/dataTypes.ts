export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface ITaskResponse {
  id: string;
  jobId: string;
  description: string;
  parameters: any;
  created: string;
  updated: string;
  status: TaskStatus;
  percentage: number;
  reason: string;
  attempts: number;
}

export interface IUpdateRequestPayload {
  status: TaskStatus;
  attempts?: number;
  reason?: string;
  description?: string;
  parameters?: unknown;
  percentage?: number;
}

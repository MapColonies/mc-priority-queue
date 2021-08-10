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
  parameters: unknown;
  created: string;
  updated: string;
  status: TaskStatus;
  percentage: number;
  reason: string;
  attempts: number;
}

export interface IUpdateTaskRequestPayload {
  status: TaskStatus;
  attempts?: number;
  reason?: string;
  description?: string;
  parameters?: unknown;
  percentage?: number;
}

export interface IJobResponse {
  id: string;
  resourceId: string;
  version: string;
  description: string;
  parameters: unknown;
  created: string;
  updated: string;
  status: TaskStatus;
  percentage: number;
  reason: string;
  attempts: number;
  type: string;
  priority: number;
  tasks: IUpdateTaskRequestPayload[];
  isCleaned: boolean;
}

export interface IUpdateJobRequestPayload {
  parameters?: unknown;
  status: TaskStatus;
  percentage?: number;
  reason?: string;
  isCleaned?: boolean;
  priority?: number;
}

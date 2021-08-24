export enum OperationStatus {
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
  status: OperationStatus;
  percentage: number;
  reason: string;
  attempts: number;
}

export interface IJobResponse {
  id: string;
  resourceId: string;
  version: string;
  description: string;
  parameters: unknown;
  created: string;
  updated: string;
  status: OperationStatus;
  percentage: number;
  reason: string;
  attempts: number;
  type: string;
  priority: number;
  tasks: IUpdateTaskBody[];
  isCleaned: boolean;
}

export interface ICreateJobBody {
  resourceId: string;
  version: string;
  parameters: Record<string, unknown>;
  type: string;
  description?: string;
  status?: OperationStatus;
  reason?: string;
  tasks?: ICreateTaskBody[];
  priority?: number;
}

export interface ICreateTaskBody {
  description?: string;
  parameters: Record<string, unknown>;
  reason?: string;
  type?: string;
  status?: OperationStatus;
  attempts?: number;
}

export interface IUpdateTaskBody {
  description?: string;
  parameters?: Record<string, unknown>;
  status: OperationStatus;
  percentage?: number;
  reason?: string;
  attempts?: number;
}

export interface IUpdateJobBody {
  parameters?: Record<string, unknown>;
  status?: OperationStatus;
  percentage?: number;
  reason?: string;
  isCleaned?: boolean;
  priority?: number;
}

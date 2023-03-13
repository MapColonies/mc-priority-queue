export enum OperationStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  EXPIRED = 'Expired',
  ABORTED = 'Aborted',
}

export interface ITaskResponse<T> {
  id: string;
  jobId: string;
  description: string;
  parameters: T;
  created: string;
  updated: string;
  type: string;
  status: OperationStatus;
  percentage?: number;
  reason: string;
  attempts: number;
  resettable: boolean;
}

export interface IJobResponse<T, P> {
  id: string;
  resourceId: string;
  version: string;
  type: string;
  description: string;
  parameters: T;
  reason: string;
  tasks?: ITaskResponse<P>[];
  created: string;
  updated: string;
  status: OperationStatus;
  percentage: number;
  isCleaned: boolean;
  priority: number;
  internalId?: string;
  producerName?: string;
  productName?: string;
  productType?: string;
  taskCount: number;
  completedTasks: number;
  failedTasks: number;
  expiredTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  abortedTasks: number;
  additionalIdentifiers?: string;
  expirationDate?: Date;
  domain: string;
}

export interface ICreateJobBody<T, P> {
  resourceId: string;
  version: string;
  parameters: T;
  type: string;
  percentage?: number;
  description?: string;
  status?: OperationStatus;
  reason?: string;
  tasks?: ICreateTaskBody<P>[];
  priority?: number;
  internalId?: string;
  producerName?: string;
  productName?: string;
  productType?: string;
  expirationDate?: Date;
  additionalIdentifiers?: string;
  domain?: string;
}

export interface ICreateJobResponse {
  id: string;
  taskIds: string[];
}

export interface ICreateTaskBody<T> {
  description?: string;
  parameters: T;
  reason?: string;
  type?: string;
  status?: OperationStatus;
  attempts?: number;
  percentage?: number;
  blockDuplication?: boolean;
}

export interface IUpdateTaskBody<T> {
  description?: string;
  parameters?: T;
  status: OperationStatus;
  percentage?: number;
  reason?: string;
  attempts?: number;
}

export interface IUpdateJobBody<T> {
  parameters?: T;
  status?: OperationStatus;
  percentage?: number;
  reason?: string;
  isCleaned?: boolean;
  priority?: number;
  internalId?: string;
  producerName?: string;
  productName?: string;
  productType?: string;
  expirationDate?: Date;
}

export interface IFindJobsRequest {
  resourceId?: string;
  version?: string;
  isCleaned?: boolean;
  status?: OperationStatus;
  type?: string;
  shouldReturnTasks?: boolean;
  productType?: string;
  fromDate?: string;
  tillDate?: string;
  internalId?: string;
}

export interface IFindTaskRequest<T> extends Partial<ITaskResponse<T>> {}

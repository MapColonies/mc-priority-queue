export enum OperationStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  EXPIRED = 'Expired',
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

export interface IJobResponse<T, P> {
  id: string;
  resourceId: string;
  version: string;
  description: string;
  parameters: T;
  created: string;
  updated: string;
  status: OperationStatus;
  percentage: number;
  reason: string;
  attempts: number;
  type: string;
  priority: number;
  tasks: IUpdateTaskBody<P>[];
  isCleaned: boolean;
  expirationDate: Date;
  internalId: string;
  producerName: string;
  productName: string;
  productType: string;
  taskCount: number;
  completedTasks: number;
  failedTasks: string;
  expiredTasks: string;
  pendingTasks: string;
  inProgressTasks: string;
}

export interface ICreateJobBody<T> {
  resourceId: string;
  version: string;
  parameters: T;
  type: string;
  percentage: number;
  description?: string;
  status?: OperationStatus;
  reason?: string;
  tasks?: ICreateTaskBody<T>[];
  priority?: number;
  expirationDate?: Date;
  internalId?: string;
  producerName?: string;
  productName?: string;
  productType?: string;
}

export interface ICreateTaskBody<T> {
  description?: string;
  parameters: T;
  reason?: string;
  type?: string;
  status?: OperationStatus;
  attempts?: number;
  percentage?: number;
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
  expirationDate?: Date;
  internalId?: string;
  producerName?: string;
  productName?: string;
  productType?: string;
}

export interface IFindTaskRequest extends Partial<ITaskResponse> {}

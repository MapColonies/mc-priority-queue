export enum OperationStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  EXPIRED = 'Expired',
}

export interface ITaskResponse<T> {
  id: string;
  jobId?: string;
  description: string;
  parameters: T;
  created: string;
  updated: string;
  status: OperationStatus;
  percentage?: number;
  reason: string;
  attempts: number;
  type: string;
  resettable: boolean;
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
  reason: string;
  type: string;
  priority: number;
  tasks: ITaskResponse<P>[];
  isCleaned: boolean;
  expirationDate?: Date;
  percentage?: number;
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
  resolution?: string;
  additionalIdentifiers?: string;
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
  expirationDate?: Date;
  internalId?: string;
  producerName?: string;
  productName?: string;
  productType?: string;
  additionalIdentifiers?: string;
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

export interface IFindTaskRequest<T> extends Partial<ITaskResponse<T>> {}

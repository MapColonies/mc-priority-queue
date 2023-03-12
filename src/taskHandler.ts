import { IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { NotFoundError } from '@map-colonies/error-types';
import { JobManagerClient } from './jobManagerClient';
import { HeartbeatClient } from './heartbeatClient';
import { ITaskResponse, IUpdateTaskBody, OperationStatus } from './models/dataTypes';
import { httpClientConfig } from './models/utils';

const minValidPercentage = 0;
const maxValidPercentage = 100;

export class TaskHandler {
  public jobManagerClient: JobManagerClient;
  public heartbeatClient: HeartbeatClient;

  public constructor(
    protected readonly logger: Logger,
    protected jobType: string,
    protected jobManagerBaseUrl: string,
    protected heartbeatUrl: string,
    protected dequeueIntervalMs: number,
    heartbeatIntervalMs: number,
    httpRetryConfig: IHttpRetryConfig | undefined = httpClientConfig,
    jobTargetService: string | undefined = 'jobManagerClient',
    heartbeatTargetService: string | undefined = 'heartbeatClient',
    disableJobManagerDebugLogs: boolean | undefined = true,
    disableHeartbeatDebugLogs: boolean | undefined = true
  ) {
    this.jobManagerClient = new JobManagerClient(logger, jobType, jobManagerBaseUrl, httpRetryConfig, jobTargetService, disableJobManagerDebugLogs);
    this.heartbeatClient = new HeartbeatClient(
      logger,
      heartbeatIntervalMs,
      heartbeatUrl,
      httpRetryConfig,
      heartbeatTargetService,
      disableHeartbeatDebugLogs
    );
  }

  public async waitForTask<T>(taskType: string): Promise<ITaskResponse<T>> {
    let task: ITaskResponse<T> | null;
    this.logger.info({ jobType: this.jobType, taskType }, `waitForTask jobType=${this.jobType}, taskType=${taskType}`);
    do {
      task = await this.dequeue(taskType);
      await new Promise((resolve) => setTimeout(resolve, this.dequeueIntervalMs));
    } while (!task);
    return task;
  }

  public async dequeue<T>(taskType: string): Promise<ITaskResponse<T> | null> {
    try {
      const response = await this.jobManagerClient.consume<T>(taskType);
      if (response) {
        const taskId = response.id;
        this.heartbeatClient.start(taskId);
      }
      return response;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return null;
      } else {
        this.logger.error({ err, jobType: this.jobType, taskType }, `dequeue FAILED for jobType=${this.jobType}, taskType=${taskType}`);
        throw err;
      }
    }
  }

  public async reject<T>(jobId: string, taskId: string, isRecoverable: boolean, reason?: string): Promise<void> {
    try {
      this.logger.info({ jobId, taskId, isRecoverable, reason }, `reject task jobId=${jobId}, taskId=${taskId}`);
      this.heartbeatClient.stop(taskId);
      let payload: IUpdateTaskBody<T> | undefined;
      if (isRecoverable) {
        const task = await this.jobManagerClient.getTask(jobId, taskId);
        if (task) {
          payload = {
            status: OperationStatus.PENDING,
            attempts: task.attempts + 1,
            reason: reason,
          };
        }
      } else {
        payload = {
          status: OperationStatus.FAILED,
        };
      }

      if (payload !== undefined) {
        this.logger.info({ jobId, taskId, isRecoverable, reason, payload }, `reject task, update with payload, jobId=${jobId}, taskId=${taskId}`);
        await this.jobManagerClient.updateTask(jobId, taskId, payload);
      }
    } catch (err) {
      this.logger.error({ err, jobId, taskId, isRecoverable, reason }, `reject task FAILED, jobId=${jobId}, taskId=${taskId}`);
      throw err;
    }
  }

  public async ack<T>(jobId: string, taskId: string): Promise<void> {
    try {
      this.logger.info({ jobId, taskId }, `ack task with jobId=${jobId}, taskId=${taskId}`);
      this.heartbeatClient.stop(taskId);
      const payload: IUpdateTaskBody<T> = {
        status: OperationStatus.COMPLETED,
        percentage: maxValidPercentage,
      };
      await this.jobManagerClient.updateTask(jobId, taskId, payload);
    } catch (err) {
      this.logger.error({ err, jobId, taskId }, `ack task failed with jobId=${jobId}, taskId=${taskId}`);
      throw err;
    }
  }

  public async updateProgress<T>(jobId: string, taskId: string, percentage: number): Promise<void> {
    const percentageValidValue = Math.min(Math.max(minValidPercentage, percentage), maxValidPercentage);
    try {
      this.logger.info({ jobId, taskId, percentageValidValue }, `updateProgress of task with jobId=${jobId}, taskId=${taskId}`);
      const payload: IUpdateTaskBody<T> = {
        status: OperationStatus.IN_PROGRESS,
        percentage: percentageValidValue,
      };
      await this.jobManagerClient.updateTask(jobId, taskId, payload);
    } catch (err) {
      this.logger.info({ err, jobId, taskId, percentageValidValue }, `updateProgress of task FAILED with jobId=${jobId}, taskId=${taskId}`);
      throw err;
    }
  }
}

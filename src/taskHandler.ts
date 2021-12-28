import { ILogger } from '@map-colonies/mc-utils';
import { NotFoundError } from '@map-colonies/error-types';
import { JobManagerClient } from './jobManagerClient';
import { HeartbeatClient } from './heartbeatClient';
import { ITaskResponse, IUpdateTaskBody, OperationStatus } from './models/dataTypes';

const minValidPrcentage = 0;
const maxValidPrcentage = 100;

export class TaskHandler {
  public jobManagerClient: JobManagerClient;
  public heartbeatClient: HeartbeatClient;

  public constructor(
    protected readonly logger: ILogger,
    protected jobType: string,
    protected taskType: string,
    protected jobManagerBaseUrl: string,
    protected heartbeatUrl: string,
    protected dequeueIntervalMs: number,
    protected heartbeatIntervalMs: number
  ) {
    this.jobManagerClient = new JobManagerClient(logger, jobType, taskType, jobManagerBaseUrl);
    this.heartbeatClient = new HeartbeatClient(logger, heartbeatIntervalMs, heartbeatUrl);
  }

  public async waitForTask(): Promise<ITaskResponse | null> {
    let task: ITaskResponse | null;
    do {
      this.logger.debug(`[TaskHandler][waitForTask]`);
      task = await this.dequeue();
      await new Promise((resolve) => setTimeout(resolve, this.dequeueIntervalMs));
    } while (!task);
    return task;
  }

  public async dequeue(): Promise<ITaskResponse | null> {
    try {
      const response = await this.jobManagerClient.consume();
      if (response) {
        const taskId = response.id;
        this.heartbeatClient.start(taskId);
      }
      return response;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return null;
      } else {
        this.logger.error(`[TaskHandler][dequeue] error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
        throw err;
      }
    }
  }

  public async reject<T>(jobId: string, taskId: string, isRecoverable: boolean, reason?: string): Promise<void> {
    try {
      this.logger.info(`[TaskHandler][reject] jobId=${jobId}, taskId=${taskId}, isRecoverable=${String(isRecoverable)}, reason=${reason as string}`);
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
        this.logger.info(
          `[TaskHandler][reject] send update with payload ${JSON.stringify(payload)} jobId=${jobId}, taskId=${taskId}, isRecoverable=${String(
            isRecoverable
          )}, reason=${reason as string}`
        );
        await this.jobManagerClient.updateTask(jobId, taskId, payload);
      }
    } catch (err) {
      this.logger.error(
        `[TaskHandler][reject] failed jobId=${jobId}, taskId=${taskId}, isRecoverable=${String(isRecoverable)}, reason=${
          reason as string
        } error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`
      );
      throw err;
    }
  }

  public async ack<T>(jobId: string, taskId: string): Promise<void> {
    try {
      this.logger.info(`[TaskHandler][ack] jobId=${jobId}, taskId=${taskId}`);
      this.heartbeatClient.stop(taskId);
      const payload: IUpdateTaskBody<T> = {
        status: OperationStatus.COMPLETED,
      };
      await this.jobManagerClient.updateTask(jobId, taskId, payload);
    } catch (err) {
      this.logger.error(`[TaskHandler][ack] failed jobId=${jobId}, taskId=${taskId} error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }

  public async updateProgress<T>(jobId: string, taskId: string, percentage: number): Promise<void> {
    const percentageValidValue = Math.min(Math.max(minValidPrcentage, percentage), maxValidPrcentage);
    try {
      this.logger.info(`[TaskHandler][updateProgress] jobId=${jobId}, taskId=${taskId}, percentageValidValue=${percentageValidValue}`);
      const payload: IUpdateTaskBody<T> = {
        status: OperationStatus.IN_PROGRESS,
        percentage: percentageValidValue,
      };
      await this.jobManagerClient.updateTask(jobId, taskId, payload);
    } catch (err) {
      this.logger.error(
        `[TaskHandler][updateProgress] failed jobId=${jobId}, taskId=${taskId}, percentageValidValue=${percentageValidValue} error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
      throw err;
    }
  }
}

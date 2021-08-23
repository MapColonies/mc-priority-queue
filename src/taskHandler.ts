import { ILogger } from '@map-colonies/mc-utils';
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
      this.logger.debug('TaskHandler: consuming task');
      task = await this.dequeue();
      await new Promise((resolve) => setTimeout(resolve, this.dequeueIntervalMs));
    } while (!task);
    return task;
  }

  public async dequeue(): Promise<ITaskResponse | null> {
    try {
      const response = await this.jobManagerClient.consume();
      if (response) {
        const jobId = response.jobId;
        const taskId = response.id;
        const payload: IUpdateTaskBody = {
          status: OperationStatus.IN_PROGRESS,
        };
        await this.jobManagerClient.updateTask(jobId, taskId, payload);
        this.heartbeatClient.start(taskId);
      }
      return response;
    } catch (err) {
      this.logger.error(`Error occurred while trying dequeue a record error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }

  public async reject(jobId: string, taskId: string, isRecoverable: boolean, reason?: string): Promise<void> {
    const logFormat = `TaskHandler: jobId=${jobId}, taskId=${taskId}, isRecoverable=${String(isRecoverable)}, reason=${reason as string}`;
    try {
      this.logger.info(`${logFormat} reject`);
      this.heartbeatClient.stop(taskId);
      let payload: IUpdateTaskBody | undefined;
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
        this.logger.info(`${logFormat} reject send update with payload ${JSON.stringify(payload)}`);
        await this.jobManagerClient.updateTask(jobId, taskId, payload);
      }
    } catch (err) {
      this.logger.error(`${logFormat} Error occurred while trying dequeue a record ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }

  public async ack(jobId: string, taskId: string): Promise<void> {
    const logFormat = `TaskHandler: jobId=${jobId}, taskId=${taskId}`;
    try {
      this.logger.info(`${logFormat} ack`);
      this.heartbeatClient.stop(taskId);
      const payload: IUpdateTaskBody = {
        status: OperationStatus.COMPLETED,
      };
      await this.jobManagerClient.updateTask(jobId, taskId, payload);
    } catch (err) {
      this.logger.error(`${logFormat} Error occurred while executing ack logic, error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }

  public async updateProgress(jobId: string, taskId: string, percentage: number): Promise<void> {
    const logFormat = `TaskHandler: jobId=${jobId}, taskId=${taskId}`;
    const percentageValidValue = Math.min(Math.max(minValidPrcentage, percentage), maxValidPrcentage);
    try {
      this.logger.info(`${logFormat} updateProgress`);
      const payload: IUpdateTaskBody = {
        status: OperationStatus.IN_PROGRESS,
        percentage: percentageValidValue,
      };
      await this.jobManagerClient.updateTask(jobId, taskId, payload);
    } catch (err) {
      this.logger.error(`${logFormat} Error occurred while trying to update Progress, error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }
}

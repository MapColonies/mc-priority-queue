import { ILogger } from '@map-colonies/mc-utils';
import { JobManagerClient } from './jobManagerClient';
import { HeartbeatClient } from './heartbeatClient';
import { ITaskResponse, IUpdateRequestPayload, TaskStatus } from './models/dataTypes';

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
    protected heartbeatIntervalMs: number
  ) {
    this.jobManagerClient = new JobManagerClient(logger, jobType, taskType, jobManagerBaseUrl);
    this.heartbeatClient = new HeartbeatClient(logger, heartbeatIntervalMs, heartbeatUrl);
  }

  public async waitForTask(): Promise<ITaskResponse | null> {
    let task: ITaskResponse | null;
    do {
      this.logger.debug('consuming task');
      task = await this.dequeue();
    } while (!task);
    return task;
  }

  public async dequeue(): Promise<ITaskResponse | null> {
    try {
      const response = await this.jobManagerClient.consume();
      if (response) {
        const jobId = response.jobId;
        const taskId = response.id;
        const payload: IUpdateRequestPayload = {
          status: TaskStatus.IN_PROGRESS,
        };
        await this.jobManagerClient.update(jobId, taskId, payload);
        this.heartbeatClient.start(taskId);
      }
      return response;
    } catch (err) {
      // TODO: print error correctly
      this.logger.error(`Error occurred while trying dequeue a record err=${JSON.stringify(err)}`);
      throw err;
    }
  }

  public async reject(jobId: string, taskId: string, isRecoverable: boolean, reason: string): Promise<void> {
    const logFormat = `jobId=${jobId}, taskId=${taskId}, isRecoverable=${String(isRecoverable)}, reason=${reason}`;
    try {
      this.logger.info(`reject ${logFormat}`);
      this.heartbeatClient.stop(taskId);
      let payload: IUpdateRequestPayload | undefined;
      if (isRecoverable) {
        const task = await this.jobManagerClient.getTask(jobId, taskId);
        if (task) {
          payload = {
            status: TaskStatus.PENDING,
            attempts: task.attempts + 1,
            reason: task.reason,
          };
        }
      } else {
        payload = {
          status: TaskStatus.FAILED,
        };
      }

      if (payload !== undefined) {
        this.logger.info(`reject send update ${logFormat} with ${JSON.stringify(payload)}`);
        await this.jobManagerClient.update(jobId, taskId, payload);
      }
    } catch (err) {
      // TODO: print error correctly
      this.logger.error(`Error occurred while trying dequeue a record ${JSON.stringify(err)}`);
      throw err;
    }
  }

  public async ack(jobId: string, taskId: string): Promise<void> {
    const logFormat = `jobId=${jobId}, taskId=${taskId}`;
    try {
      this.logger.info(`ack ${logFormat}`);
      this.heartbeatClient.stop(taskId);
      const payload: IUpdateRequestPayload = {
        status: TaskStatus.COMPLETED,
      };
      await this.jobManagerClient.update(jobId, taskId, payload);
    } catch (err) {
      // TODO: print error correctly
      this.logger.error(`Error occurred while trying update ack for ${logFormat}, error=${JSON.stringify(err)}`);
      throw err;
    }
  }

  public async updateProgress(jobId: string, taskId: string, percentage: number): Promise<void> {
    const logFormat = `jobId=${jobId}, taskId=${taskId}`;
    const percentageValidValue = Math.min(Math.max(minValidPrcentage, percentage), maxValidPrcentage);
    try {
      this.logger.info(`updateProgress ${logFormat}`);
      const payload: IUpdateRequestPayload = {
        status: TaskStatus.IN_PROGRESS,
        percentage: percentageValidValue,
      };
      await this.jobManagerClient.update(jobId, taskId, payload);
    } catch (err) {
      // TODO: print error correctly
      this.logger.error(`Error occurred while trying to update Progress for ${logFormat}, error=${JSON.stringify(err)}`);
      throw err;
    }
  }
}

import { ILogger, HttpClient } from '@map-colonies/mc-utils';
import { NotFoundError } from '@map-colonies/error-types';
import { ITaskResponse, IUpdateRequestPayload } from './models/dataTypes';

export class JobManagerClient extends HttpClient {
  public constructor(protected readonly logger: ILogger, protected jobType: string, protected taskType: string, protected jobManagerBaseUrl: string) {
    super(logger, jobManagerBaseUrl, 'jobManagerClient', {
      attempts: 3,
      delay: 'exponential',
      shouldResetTimeout: true,
    });
  }

  public async getTask(jobId: string, taskId: string): Promise<ITaskResponse | null> {
    const logFormat = `jobId=${jobId}, taskId=${taskId}`;
    try {
      this.logger.info(`get task ${logFormat}`);
      const getTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      const task = await this.get<ITaskResponse>(getTaskUrl);
      return task;
    } catch (err) {
      this.logger.error(`failed to get task ${logFormat}`);
      throw err;
    }
  }

  public async consume(): Promise<ITaskResponse | null> {
    const logFormat = `jobType=${this.jobType}, taskType=${this.taskType}`;
    try {
      this.logger.info(`consume ${logFormat}`);
      const consumeTaskUrl = `/tasks/${this.jobType}/${this.taskType}/startPending`;
      const taskResponse = await this.get<ITaskResponse>(consumeTaskUrl);
      return taskResponse;
    } catch (err) {
      if (err === NotFoundError) {
        return null;
      } else {
        this.logger.error(`failed to consume ${logFormat}`);
        throw err;
      }
    }
  }

  public async update(jobId: string, taskId: string, payload: IUpdateRequestPayload) {
    const logFormat = `jobId=${jobId}, taskId=${taskId}`;
    try {
      this.logger.info(`update task ${logFormat}`);
      const updateTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      const taskResponse = await this.post(updateTaskUrl, payload);
      return taskResponse;
    } catch (err) {
      this.logger.error(`failed to update task ${logFormat}`);
      throw err;
    }
  }
}

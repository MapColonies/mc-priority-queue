import { ILogger, HttpClient } from '@map-colonies/mc-utils';
import { NotFoundError } from '@map-colonies/error-types';
import { IJobResponse, ITaskResponse, IUpdateJobRequestPayload, IUpdateTaskRequestPayload } from './models/dataTypes';

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

  public async getJob(jobId: string): Promise<IJobResponse | undefined> {
    try {
      this.logger.info(`get job ${jobId}`);
      const job = await this.get<IJobResponse>(`/jobs/${jobId}`);
      return job;
    } catch {
      this.logger.error(`failed to get job data for job: ${jobId}`);
      return undefined;
    }
  }

  public async consume(): Promise<ITaskResponse | null> {
    const logFormat = `jobType=${this.jobType}, taskType=${this.taskType}`;
    try {
      this.logger.info(`consume ${logFormat}`);
      const consumeTaskUrl = `/tasks/${this.jobType}/${this.taskType}/startPending`;
      const taskResponse = await this.post<ITaskResponse>(consumeTaskUrl);
      return taskResponse;
    } catch (err) {
      if (err instanceof NotFoundError) {
        this.logger.debug('failed to consume task due empty queue');
        return null;
      } else {
        this.logger.error(`failed to consume ${logFormat}`);
        throw err;
      }
    }
  }

  public async updateTask(jobId: string, taskId: string, payload: IUpdateTaskRequestPayload): Promise<void> {
    const logFormat = `jobId=${jobId}, taskId=${taskId}`;
    try {
      this.logger.info(`update task ${logFormat} payload=${JSON.stringify(payload)}`);
      const updateTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      await this.put(updateTaskUrl, payload);
    } catch (err) {
      this.logger.error(`failed to update task ${logFormat}`);
      throw err;
    }
  }

  public async updateJob(jobId: string, payload: IUpdateJobRequestPayload): Promise<void> {
    try {
      this.logger.info(`update job Id=${jobId} payload=${JSON.stringify(payload)}`);
      const updateJobUrl = `/jobs/${jobId}`;
      await this.put(updateJobUrl, payload);
    } catch (err) {
      this.logger.error(`failed to update job Id=${jobId}`);
      throw err;
    }
  }
}

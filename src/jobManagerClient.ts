import { ILogger, HttpClient } from '@map-colonies/mc-utils';
import { NotFoundError } from '@map-colonies/error-types';
import { ICreateJobBody, IJobResponse, ITaskResponse, IUpdateJobBody, IUpdateTaskBody } from './models/dataTypes';

export class JobManagerClient extends HttpClient {
  public constructor(protected readonly logger: ILogger, protected jobType: string, protected taskType: string, protected jobManagerBaseUrl: string) {
    super(logger, jobManagerBaseUrl, 'jobManagerClient', {
      attempts: 3,
      delay: 'exponential',
      shouldResetTimeout: true,
    });
  }

  public async getTask(jobId: string, taskId: string): Promise<ITaskResponse | null> {
    try {
      this.logger.info(`[JobManagerClient][getTask] jobId=${jobId}, taskId=${taskId}`);
      const getTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      const task = await this.get<ITaskResponse>(getTaskUrl);
      return task;
    } catch (err) {
      this.logger.error(`[JobManagerClient][getTask] jobId=${jobId}, taskId=${taskId} failed to get task`);
      throw err;
    }
  }

  public async getTasksForJob(jobId: string): Promise<ITaskResponse[] | null> {
    try {
      this.logger.info(`[JobManagerClient][getTasksForJob] jobId=${jobId}`);
      const getTaskUrl = `/jobs/${jobId}/tasks`;
      const tasks = await this.get<ITaskResponse[]>(getTaskUrl);
      return tasks;
    } catch (err) {
      this.logger.error(`[JobManagerClient][getTasksForJob] jobId=${jobId} failed`);
      throw err;
    }
  }

  public async getJob(jobId: string): Promise<IJobResponse | undefined> {
    try {
      this.logger.info(`[JobManagerClient][getJob] jobId=${jobId}`);
      const job = await this.get<IJobResponse>(`/jobs/${jobId}`);
      return job;
    } catch {
      this.logger.error(`[JobManagerClient][getJob] jobId=${jobId} failed`);
      return undefined;
    }
  }

  public async consume(): Promise<ITaskResponse | null> {
    try {
      this.logger.debug(`[JobManagerClient][consume] jobType=${this.jobType}, taskType=${this.taskType}`);
      const consumeTaskUrl = `/tasks/${this.jobType}/${this.taskType}/startPending`;
      const taskResponse = await this.post<ITaskResponse>(consumeTaskUrl);
      return taskResponse;
    } catch (err) {
      if (err instanceof NotFoundError) {
        this.logger.debug(`[JobManagerClient][consume] jobType=${this.jobType}, taskType=${this.taskType}, failed to consume due empty queue`);
        return null;
      } else {
        this.logger.error(`[JobManagerClient][consume] jobType=${this.jobType}, taskType=${this.taskType}, failed to consume`);
        throw err;
      }
    }
  }

  public async enqueueTask(jobId: string, payload: IUpdateTaskBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][enqueueTask] jobId=${jobId}, payload=${JSON.stringify(payload)}`);
      const createTaskUrl = `/jobs/${jobId}/tasks`;
      await this.post(createTaskUrl, payload);
    } catch (err) {
      this.logger.error(`[JobManagerClient][enqueueTask] jobId=${jobId}, payload=${JSON.stringify(payload)} failed`);
      throw err;
    }
  }

  public async updateTask(jobId: string, taskId: string, payload: IUpdateTaskBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][updateTask] jobId=${jobId}, taskId=${taskId}, payload=${JSON.stringify(payload)}`);
      const updateTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      await this.put(updateTaskUrl, payload);
    } catch (err) {
      this.logger.error(`[JobManagerClient][updateTask] jobId=${jobId}, taskId=${taskId}, payload=${JSON.stringify(payload)} failed`);
      throw err;
    }
  }

  public async createJob(payload: ICreateJobBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][createJob] payload=${JSON.stringify(payload)}`);
      const createJobUrl = `/jobs`;
      await this.post(createJobUrl, payload);
    } catch (err) {
      this.logger.error(`[JobManagerClient][createJob] payload=${JSON.stringify(payload)} failed`);
      throw err;
    }
  }

  public async updateJob(jobId: string, payload: IUpdateJobBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][updateJob] jobId=${jobId}, payload=${JSON.stringify(payload)}`);
      const updateJobUrl = `/jobs/${jobId}`;
      await this.put(updateJobUrl, payload);
    } catch (err) {
      this.logger.error(`[JobManagerClient][updateJob] jobId=${jobId}, payload=${JSON.stringify(payload)} failed`);
      throw err;
    }
  }
}

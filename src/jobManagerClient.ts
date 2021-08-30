import { ILogger, HttpClient } from '@map-colonies/mc-utils';
import { NotFoundError } from '@map-colonies/error-types';
import { ICreateJobBody, ICreateTaskBody, IFindTaskRequest, IJobResponse, ITaskResponse, IUpdateJobBody, IUpdateTaskBody } from './models/dataTypes';

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
      this.logger.error(
        `[JobManagerClient][getTask] jobId=${jobId}, taskId=${taskId} failed to get task error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
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
      this.logger.error(`[JobManagerClient][getTasksForJob] jobId=${jobId} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }

  public async getJob(jobId: string): Promise<IJobResponse | undefined> {
    try {
      this.logger.info(`[JobManagerClient][getJob] jobId=${jobId}`);
      const job = await this.get<IJobResponse>(`/jobs/${jobId}`);
      return job;
    } catch (err) {
      this.logger.error(`[JobManagerClient][getJob] jobId=${jobId} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
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
        this.logger.error(
          `[JobManagerClient][consume] jobType=${this.jobType}, taskType=${this.taskType}, failed to consume error=${JSON.stringify(
            err,
            Object.getOwnPropertyNames(err)
          )}`
        );
        throw err;
      }
    }
  }

  public async enqueueTask(jobId: string, payload: ICreateTaskBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][enqueueTask] jobId=${jobId}, payload=${JSON.stringify(payload)}`);
      const createTaskUrl = `/jobs/${jobId}/tasks`;
      await this.post(createTaskUrl, payload);
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][enqueueTask] jobId=${jobId}, payload=${JSON.stringify(payload)} failed error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
      throw err;
    }
  }

  public async updateTask(jobId: string, taskId: string, payload: IUpdateTaskBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][updateTask] jobId=${jobId}, taskId=${taskId}, payload=${JSON.stringify(payload)}`);
      const updateTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      await this.put(updateTaskUrl, payload);
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][updateTask] jobId=${jobId}, taskId=${taskId}, payload=${JSON.stringify(payload)} failed error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
      throw err;
    }
  }

  public async findTasks(criteria: IFindTaskRequest): Promise<ITaskResponse[] | undefined> {
    this.logger.debug(`[JobManagerClient][findTasks] finding task with data: ${JSON.stringify(criteria)}`);
    const findTaskUrl = '/tasks/find';
    try {
      const res = await this.post<ITaskResponse[]>(findTaskUrl, criteria);
      return res;
    } catch (err) {
      if (err instanceof NotFoundError) {
        this.logger.debug(`[JobManagerClient][findTasks] no tasks match specified criteria`);
        return undefined;
      } else {
        this.logger.error(`[JobManagerClient][findTasks] filed to search tasks: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
        throw err;
      }
    }
  }

  public async createJob(payload: ICreateJobBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][createJob] payload=${JSON.stringify(payload)}`);
      const createJobUrl = `/jobs`;
      await this.post(createJobUrl, payload);
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][createJob] payload=${JSON.stringify(payload)} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`
      );
      throw err;
    }
  }

  public async updateJob(jobId: string, payload: IUpdateJobBody): Promise<void> {
    try {
      this.logger.info(`[JobManagerClient][updateJob] jobId=${jobId}, payload=${JSON.stringify(payload)}`);
      const updateJobUrl = `/jobs/${jobId}`;
      await this.put(updateJobUrl, payload);
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][updateJob] jobId=${jobId}, payload=${JSON.stringify(payload)} failed error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
      throw err;
    }
  }
}

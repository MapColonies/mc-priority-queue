import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { NotFoundError } from '@map-colonies/error-types';
import { Logger } from '@map-colonies/js-logger';
import {
  ICreateJobBody,
  ICreateTaskBody,
  IFindTaskRequest,
  ICreateJobResponse,
  IJobResponse,
  ITaskResponse,
  IUpdateJobBody,
  IUpdateTaskBody,
} from './models/dataTypes';
import { httpClientConfig } from './models/utils';

export class JobManagerClient extends HttpClient {
  public constructor(
    protected readonly logger: Logger,
    protected jobType: string,
    protected taskType: string,
    protected jobManagerBaseUrl: string,
    protected httpRetryConfig: IHttpRetryConfig = httpClientConfig
  ) {
    super(logger, jobManagerBaseUrl, 'jobManagerClient', httpRetryConfig, true);
  }

  public async getTask<T>(jobId: string, taskId: string): Promise<ITaskResponse<T> | null> {
    try {
      this.logger.info(`[JobManagerClient][getTask] jobId=${jobId}, taskId=${taskId}`);
      const getTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
      const task = await this.get<ITaskResponse<T>>(getTaskUrl);
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

  public async getTasksForJob<T>(jobId: string): Promise<ITaskResponse<T>[] | null> {
    try {
      this.logger.info(`[JobManagerClient][getTasksForJob] jobId=${jobId}`);
      const getTaskUrl = `/jobs/${jobId}/tasks`;
      const tasks = await this.get<ITaskResponse<T>[]>(getTaskUrl);
      return tasks;
    } catch (err) {
      this.logger.error(`[JobManagerClient][getTasksForJob] jobId=${jobId} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }

  public async getJob<T, P>(jobId: string, shouldReturnTasks = false): Promise<IJobResponse<T, P> | undefined> {
    try {
      this.logger.info(`[JobManagerClient][getJob] jobId=${jobId}`);
      const job = await this.get<IJobResponse<T, P>>(`/jobs/${jobId}`, { shouldReturnTasks });
      return job;
    } catch (err) {
      this.logger.error(`[JobManagerClient][getJob] jobId=${jobId} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      return undefined;
    }
  }

  public async getJobs<T, P>(resourceId: string, productType: string, shouldReturnTasks = false): Promise<IJobResponse<T, P>[]> {
    try {
      this.logger.debug(
        `[JobManagerClient][getJobs] resourceId=${resourceId} productType=${productType}, shouldReturnTasks=${shouldReturnTasks.toString()}`
      );
      const res = await this.get<IJobResponse<T, P>[]>('/jobs', {
        resourceId: encodeURIComponent(resourceId),
        productType: encodeURIComponent(productType),
        shouldReturnTasks: shouldReturnTasks,
      });
      if (typeof res === 'string' || res.length === 0) {
        return [];
      }
      return res;
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][getJobs] resourceId=${resourceId} productType=${productType}, shouldReturnTasks=${shouldReturnTasks.toString()}, failed error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
      throw err;
    }
  }

  public async getJobByInternalId<T, P>(internalId: string): Promise<IJobResponse<T, P>[]> {
    try {
      this.logger.debug(
        `[JobManagerClient][getJobByInternalId] internalId=${internalId}`
      );
      const getLayerUrl = `/jobs`;
      const res = await this.get<IJobResponse<T, P>[]>(getLayerUrl, { internalId, shouldReturnTasks: false });
      if (typeof res === 'string' || res.length === 0) {
        return [];
      }
      return res;
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][getJobByInternalId] internalId=${internalId}, failed error=${JSON.stringify(
          err,
          Object.getOwnPropertyNames(err)
        )}`
      );
      throw err;
    }
  }

  public async consume<T>(): Promise<ITaskResponse<T> | null> {
    try {
      const consumeTaskUrl = `/tasks/${this.jobType}/${this.taskType}/startPending`;
      const taskResponse = await this.post<ITaskResponse<T>>(consumeTaskUrl);
      return taskResponse;
    } catch (err) {
      if (err instanceof NotFoundError) {
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

  public async enqueueTask<T>(jobId: string, payload: ICreateTaskBody<T>): Promise<void> {
    try {
      this.logger.debug(`[JobManagerClient][enqueueTask] jobId=${jobId}, payload=${JSON.stringify(payload)}`);
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

  public async updateTask<T>(jobId: string, taskId: string, payload: IUpdateTaskBody<T>): Promise<void> {
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

  public async findTasks<T>(criteria: IFindTaskRequest<T>): Promise<ITaskResponse<T>[] | undefined> {
    this.logger.debug(`[JobManagerClient][findTasks] finding task with data: ${JSON.stringify(criteria)}`);
    const findTaskUrl = '/tasks/find';
    try {
      const res = await this.post<ITaskResponse<T>[]>(findTaskUrl, criteria);
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

  public async createJob<T, P>(payload: ICreateJobBody<T, P>): Promise<ICreateJobResponse> {
    try {
      this.logger.info(`[JobManagerClient][createJob] payload=${JSON.stringify(payload)}`);
      const createJobUrl = `/jobs`;
      const res = await this.post<ICreateJobResponse>(createJobUrl, payload);
      return res;
    } catch (err) {
      this.logger.error(
        `[JobManagerClient][createJob] payload=${JSON.stringify(payload)} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`
      );
      throw err;
    }
  }

  public async updateJob<T>(jobId: string, payload: IUpdateJobBody<T>): Promise<void> {
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

  public async abortJob(jobId: string): Promise<void> {
    try {
      this.logger.debug(`[JobManagerClient][abortJob] jobId=${jobId}`);
      const abortJobUrl = `/tasks/abort/${jobId}`;
      await this.post(abortJobUrl);
    } catch (err) {
      this.logger.error(`[JobManagerClient][abortJob] jobId=${jobId}, failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }
  }
}

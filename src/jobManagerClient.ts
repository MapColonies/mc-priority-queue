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
  IFindJobsRequest,
} from './models/dataTypes';
import { httpClientConfig } from './models/utils';

export class JobManagerClient extends HttpClient {
  public constructor(
    protected readonly logger: Logger,
    protected jobType: string,
    protected jobManagerBaseUrl: string,
    httpRetryConfig: IHttpRetryConfig | undefined = httpClientConfig,
    targetService: string | undefined = 'jobManagerClient',
    disableDebugLogs: boolean | undefined = true
  ) {
    super(logger, jobManagerBaseUrl, targetService, httpRetryConfig, disableDebugLogs);
  }

  public async getTask<T>(jobId: string, taskId: string): Promise<ITaskResponse<T> | null> {
    const getTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
    try {
      this.logger.info({ jobId, taskId, url: getTaskUrl, targetService: this.targetService }, `getTask jobId=${jobId}, taskId=${taskId}`);
      const task = await this.get<ITaskResponse<T>>(getTaskUrl);
      return task;
    } catch (err) {
      this.logger.error(
        { err, jobId, taskId, url: getTaskUrl, targetService: this.targetService },
        `failed to getTask for jobId=${jobId}, taskId=${taskId}`
      );
      throw err;
    }
  }

  public async getTasksForJob<T>(jobId: string): Promise<ITaskResponse<T>[] | null> {
    const getTaskUrl = `/jobs/${jobId}/tasks`;
    try {
      this.logger.info({ jobId, url: getTaskUrl, targetService: this.targetService }, `getTasksForJob jobId=${jobId}`);
      const tasks = await this.get<ITaskResponse<T>[]>(getTaskUrl);
      return tasks;
    } catch (err) {
      this.logger.error({ err, jobId, url: getTaskUrl, targetService: this.targetService }, `failed to getTasksForJob for jobId=${jobId}`);
      throw err;
    }
  }

  public async getJob<T, P>(jobId: string, shouldReturnTasks = false): Promise<IJobResponse<T, P> | undefined> {
    const getJobUrl = `/jobs/${jobId}`;
    try {
      this.logger.info({ jobId, url: getJobUrl, targetService: this.targetService }, `getJob jobId=${jobId}`);
      const job = await this.get<IJobResponse<T, P>>(getJobUrl, { shouldReturnTasks });
      return job;
    } catch (err) {
      this.logger.error({ err, jobId, url: getJobUrl, targetService: this.targetService }, `failed to getJob for jobId=${jobId}`);
      return undefined;
    }
  }

  public async getJobs<T, P>(findJobsParams: IFindJobsRequest): Promise<IJobResponse<T, P>[]> {
    const getJobsUrl = '/jobs';
    if (findJobsParams.resourceId !== undefined) {
      findJobsParams.resourceId = encodeURIComponent(findJobsParams.resourceId);
    }
    if (findJobsParams.productType !== undefined) {
      findJobsParams.productType = encodeURIComponent(findJobsParams.productType);
    }
    try {
      this.logger.info({ url: getJobsUrl, targetService: this.targetService, findJobsParams }, `getJobs`);
      const res = await this.get<IJobResponse<T, P>[]>(getJobsUrl, {
        resourceId: findJobsParams.resourceId,
        version: findJobsParams.version,
        isCleaned: findJobsParams.isCleaned,
        productType: findJobsParams.productType,
        status: findJobsParams.status,
        type: findJobsParams.type,
        shouldReturnTasks: findJobsParams.shouldReturnTasks,
        fromDate: findJobsParams.fromDate,
        tillDate: findJobsParams.tillDate,
        internalId: findJobsParams.internalId,
      });
      if (typeof res === 'string' || res.length === 0) {
        return [];
      }
      return res;
    } catch (err) {
      this.logger.error({ err, url: getJobsUrl, targetService: this.targetService, findJobsParams }, `failed to getJobs`);
      throw err;
    }
  }

  public async consume<T>(taskType: string): Promise<ITaskResponse<T> | null> {
    const consumeTaskUrl = `/tasks/${this.jobType}/${taskType}/startPending`;
    try {
      const taskResponse = await this.post<ITaskResponse<T>>(consumeTaskUrl);
      return taskResponse;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return null;
      } else {
        this.logger.error(
          { err, url: consumeTaskUrl, targetService: this.targetService, jobType: this.jobType, taskType: taskType },
          `failed to consume task`
        );
        throw err;
      }
    }
  }

  public async enqueueTask<T>(jobId: string, payload: ICreateTaskBody<T>): Promise<void> {
    const createTaskUrl = `/jobs/${jobId}/tasks`;
    try {
      this.logger.debug({ jobId, url: createTaskUrl, targetService: this.targetService, payload }, `enqueueTask for jobId=${jobId}`);
      await this.post(createTaskUrl, payload);
    } catch (err) {
      this.logger.error({ err, url: createTaskUrl, targetService: this.targetService, payload }, `failed to enqueueTask for jobId=${jobId}`);
      throw err;
    }
  }

  public async updateTask<T>(jobId: string, taskId: string, payload: IUpdateTaskBody<T>): Promise<void> {
    const updateTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
    try {
      this.logger.info(
        { url: updateTaskUrl, targetService: this.targetService, jobId, taskId, payload },
        `updateTask for jobId=${jobId}, taskId=${taskId}`
      );
      await this.put(updateTaskUrl, payload);
    } catch (err) {
      this.logger.error(
        { err, url: updateTaskUrl, targetService: this.targetService, jobId, taskId, payload },
        `failed to updateTask for jobId=${jobId}, taskId=${taskId}`
      );
      throw err;
    }
  }

  public async findTasks<T>(criteria: IFindTaskRequest<T>): Promise<ITaskResponse<T>[] | undefined> {
    const findTaskUrl = '/tasks/find';
    this.logger.debug({ url: findTaskUrl, targetService: this.targetService, criteria }, `findTasks`);
    try {
      const res = await this.post<ITaskResponse<T>[]>(findTaskUrl, criteria);
      return res;
    } catch (err) {
      if (err instanceof NotFoundError) {
        this.logger.debug({ url: findTaskUrl, targetService: this.targetService }, `findTasks response - no tasks match specified criteria`);
        return undefined;
      } else {
        this.logger.error({ err, url: findTaskUrl, targetService: this.targetService, criteria }, `failed to findTasks`);
        throw err;
      }
    }
  }

  public async createJob<T, P>(payload: ICreateJobBody<T, P>): Promise<ICreateJobResponse> {
    const createJobUrl = `/jobs`;
    try {
      this.logger.info({ url: createJobUrl, targetService: this.targetService, payload }, `createJob`);
      const res = await this.post<ICreateJobResponse>(createJobUrl, payload);
      return res;
    } catch (err) {
      this.logger.error({ err, url: createJobUrl, targetService: this.targetService, payload }, `createJob failed`);
      throw err;
    }
  }

  public async updateJob<T>(jobId: string, payload: IUpdateJobBody<T>): Promise<void> {
    const updateJobUrl = `/jobs/${jobId}`;
    try {
      this.logger.info({ url: updateJobUrl, targetService: this.targetService, jobId, payload }, `updateJob with jobId=${jobId}`);
      await this.put(updateJobUrl, payload);
    } catch (err) {
      this.logger.error({ err, url: updateJobUrl, targetService: this.targetService, jobId, payload }, `updateJob with jobId=${jobId} failed`);
      throw err;
    }
  }

  public async abortJob(jobId: string): Promise<void> {
    const abortJobUrl = `/tasks/abort/${jobId}`;
    try {
      this.logger.info({ url: abortJobUrl, targetService: this.targetService, jobId }, `abortJob jobId=${jobId}`);
      await this.post(abortJobUrl);
    } catch (err) {
      this.logger.error({ err, url: abortJobUrl, targetService: this.targetService, jobId }, `abortJob jobId=${jobId} failed`);
      throw err;
    }
  }
}

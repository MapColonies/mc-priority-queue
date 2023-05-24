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
    protected jobManagerBaseUrl: string,
    httpRetryConfig: IHttpRetryConfig | undefined = httpClientConfig,
    targetService: string | undefined = 'jobManagerClient',
    disableDebugLogs: boolean | undefined = true
  ) {
    super(logger, jobManagerBaseUrl, targetService, httpRetryConfig, disableDebugLogs);
  }

  public async getTask<T>(jobId: string, taskId: string): Promise<ITaskResponse<T>> {
    const getTaskUrl = this.getJobAndTaskUrl(jobId, taskId);
    try {
      this.logger.debug({
        jobId,
        taskId,
        url: getTaskUrl,
        targetService: this.targetService,
        msg: `getTask jobId=${jobId}, taskId=${taskId}`,
      });
      const task = await this.get<ITaskResponse<T>>(getTaskUrl);
      return task;
    } catch (err) {
      this.logger.error({
        err,
        jobId,
        taskId,
        url: getTaskUrl,
        targetService: this.targetService,
        msg: `failed to getTask for jobId=${jobId}, taskId=${taskId}`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async getTasksForJob<T>(jobId: string): Promise<ITaskResponse<T>[]> {
    const getTaskUrl = this.getTasksUrl(jobId);
    try {
      this.logger.debug({
        jobId,
        url: getTaskUrl,
        targetService: this.targetService,
        msg: `getTasksForJob jobId=${jobId}`,
      });
      const tasks = await this.get<ITaskResponse<T>[]>(getTaskUrl);
      return tasks;
    } catch (err) {
      this.logger.error({
        err,
        jobId,
        url: getTaskUrl,
        targetService: this.targetService,
        msg: `failed to getTasksForJob for jobId=${jobId}`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async getJob<T, P>(jobId: string, shouldReturnTasks = false): Promise<IJobResponse<T, P>> {
    const getJobUrl = this.getJobUrl(jobId);
    try {
      this.logger.debug({
        jobId,
        url: getJobUrl,
        targetService: this.targetService,
        msg: `getJob jobId=${jobId}`,
      });
      const job = await this.get<IJobResponse<T, P>>(getJobUrl, { shouldReturnTasks });
      return job;
    } catch (err) {
      this.logger.error({
        err,
        jobId,
        url: getJobUrl,
        targetService: this.targetService,
        msg: `failed to getJob for jobId=${jobId}`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async getJobs<T, P>(findJobsParams: IFindJobsRequest): Promise<IJobResponse<T, P>[]> {
    const getJobsUrl = this.getJobsUrl();
    if (findJobsParams.resourceId !== undefined) {
      findJobsParams.resourceId = encodeURIComponent(findJobsParams.resourceId);
    }
    if (findJobsParams.productType !== undefined) {
      findJobsParams.productType = encodeURIComponent(findJobsParams.productType);
    }
    try {
      this.logger.debug({
        url: getJobsUrl,
        targetService: this.targetService,
        findJobsParams,
        msg: `getJobs`,
      });
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
      this.logger.error({
        err,
        url: getJobsUrl,
        targetService: this.targetService,
        findJobsParams,
        msg: `failed to getJobs`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async consume<T>(taskType: string, jobType: string): Promise<ITaskResponse<T> | null> {
    const consumeTaskUrl = `/tasks/${jobType}/${taskType}/startPending`;
    try {
      const taskResponse = await this.post<ITaskResponse<T>>(consumeTaskUrl);
      return taskResponse;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return null;
      } else {
        this.logger.error({
          err,
          url: consumeTaskUrl,
          targetService: this.targetService,
          jobType,
          taskType: taskType,
          msg: `failed to consume task`,
          errorMessage: (err as { message: string }).message,
        });
        throw err;
      }
    }
  }

  public async enqueueTask<T>(jobId: string, payload: ICreateTaskBody<T>): Promise<void> {
    const createTaskUrl = this.getTasksUrl(jobId);
    try {
      this.logger.debug({
        jobId,
        url: createTaskUrl,
        targetService: this.targetService,
        payload,
        msg: `enqueueTask for jobId=${jobId}`,
      });
      await this.post(createTaskUrl, payload);
    } catch (err) {
      this.logger.error({
        err,
        url: createTaskUrl,
        targetService: this.targetService,
        payload,
        msg: `failed to enqueueTask for jobId=${jobId}`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async updateTask<T>(jobId: string, taskId: string, payload: IUpdateTaskBody<T>): Promise<void> {
    const updateTaskUrl = this.getJobAndTaskUrl(jobId, taskId);
    try {
      this.logger.info({
        url: updateTaskUrl,
        targetService: this.targetService,
        jobId,
        taskId,
        payload,
        msg: `updateTask for jobId=${jobId}, taskId=${taskId}`,
      });
      await this.put(updateTaskUrl, payload);
    } catch (err) {
      this.logger.error({
        err,
        url: updateTaskUrl,
        targetService: this.targetService,
        jobId,
        taskId,
        payload,
        msg: `failed to updateTask for jobId=${jobId}, taskId=${taskId}`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async findTasks<T>(criteria: IFindTaskRequest<T>): Promise<ITaskResponse<T>[] | null> {
    const findTaskUrl = '/tasks/find';
    this.logger.debug({
      url: findTaskUrl,
      targetService: this.targetService,
      criteria,
      msg: `findTasks`,
    });
    try {
      const res = await this.post<ITaskResponse<T>[]>(findTaskUrl, criteria);
      return res;
    } catch (err) {
      if (err instanceof NotFoundError) {
        this.logger.debug({
          url: findTaskUrl,
          targetService: this.targetService,
          msg: `findTasks response - no tasks match specified criteria`,
        });
        return null;
      } else {
        this.logger.error({
          err,
          url: findTaskUrl,
          targetService: this.targetService,
          criteria,
          msg: `failed to findTasks`,
          errorMessage: (err as { message: string }).message,
        });
        throw err;
      }
    }
  }

  public async createJob<T, P>(payload: ICreateJobBody<T, P>): Promise<ICreateJobResponse> {
    const createJobUrl = this.getJobsUrl();
    try {
      this.logger.info({
        url: createJobUrl,
        targetService: this.targetService,
        payload,
        msg: `createJob`,
      });
      const res = await this.post<ICreateJobResponse>(createJobUrl, payload);
      this.logger.info({
        url: createJobUrl,
        targetService: this.targetService,
        res,
        jobId: res.id,
        resourceId: payload.resourceId,
        jobType: payload.type,
        version: payload.version,
        msg: `Job id ${res.id} created for resourceId: ${payload.resourceId}, version: ${payload.version}, type: ${payload.type}`,
      });
      return res;
    } catch (err) {
      this.logger.error({
        err,
        url: createJobUrl,
        targetService: this.targetService,
        payload,
        msg: `createJob failed`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async updateJob<T>(jobId: string, payload: IUpdateJobBody<T>): Promise<void> {
    const updateJobUrl = this.getJobUrl(jobId);
    try {
      this.logger.info({
        url: updateJobUrl,
        targetService: this.targetService,
        jobId,
        payload,
        msg: `updateJob with jobId=${jobId}`,
      });
      await this.put(updateJobUrl, payload);
    } catch (err) {
      this.logger.error({
        err,
        url: updateJobUrl,
        targetService: this.targetService,
        jobId,
        payload,
        msg: `updateJob with jobId=${jobId} failed`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async abortJob(jobId: string): Promise<void> {
    const abortJobUrl = `/tasks/abort/${jobId}`;
    try {
      this.logger.info({
        url: abortJobUrl,
        targetService: this.targetService,
        jobId,
        msg: `abortJob jobId=${jobId}`,
      });
      await this.post(abortJobUrl);
    } catch (err) {
      this.logger.error({
        err,
        url: abortJobUrl,
        targetService: this.targetService,
        jobId,
        msg: `abortJob jobId=${jobId} failed`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  public async createTaskForJob<T>(jobId: string, taskBody: ICreateTaskBody<T>): Promise<void> {
    const createTaskForJobUrl = this.getTaskForJobUrl(jobId);
    try {
      this.logger.info({
        url: createTaskForJobUrl,
        targetService: this.targetService,
        jobId,
        msg: `createTaskForJob jobId=${jobId}`,
      });

      await this.post(createTaskForJobUrl, taskBody);
    } catch (err) {
      this.logger.error({
        err,
        url: createTaskForJobUrl,
        targetService: this.targetService,
        jobId,
        msg: `createTaskForJob jobId=${jobId} failed`,
        errorMessage: (err as { message: string }).message,
      });
      throw err;
    }
  }

  protected getTaskForJobUrl(jobId: string): string {
    const taskForJobUrl = `/jobs/${jobId}/tasks`;
    return taskForJobUrl;
  }

  protected getJobAndTaskUrl(jobId: string, taskId: string): string {
    const taskUrl = `/jobs/${jobId}/tasks/${taskId}`;
    return taskUrl;
  }

  protected getJobsUrl(): string {
    const jobsUrl = '/jobs';
    return jobsUrl;
  }

  protected getJobUrl(jobId: string): string {
    const jobUrl = `/jobs/${jobId}`;
    return jobUrl;
  }

  protected getTasksUrl(jobId: string): string {
    const tasksUrl = `/jobs/${jobId}/tasks`;
    return tasksUrl;
  }
}

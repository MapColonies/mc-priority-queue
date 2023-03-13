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

  public async getTasksForJob<T>(jobId: string): Promise<ITaskResponse<T>[] | null> {
    const getTaskUrl = `/jobs/${jobId}/tasks`;
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

  public async getJob<T, P>(jobId: string, shouldReturnTasks = false): Promise<IJobResponse<T, P> | undefined> {
    const getJobUrl = `/jobs/${jobId}`;
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

  public async consume<T>(taskType: string): Promise<ITaskResponse<T> | null> {
    const consumeTaskUrl = `/tasks/${this.jobType}/${taskType}/startPending`;
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
          jobType: this.jobType,
          taskType: taskType,
          msg: `failed to consume task`,
          errorMessage: (err as { message: string }).message,
        });
        throw err;
      }
    }
  }

  public async enqueueTask<T>(jobId: string, payload: ICreateTaskBody<T>): Promise<void> {
    const createTaskUrl = `/jobs/${jobId}/tasks`;
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
    const updateTaskUrl = `/jobs/${jobId}/tasks/${taskId}`;
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

  public async findTasks<T>(criteria: IFindTaskRequest<T>): Promise<ITaskResponse<T>[] | undefined> {
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
        return undefined;
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
    const createJobUrl = `/jobs`;
    try {
      this.logger.info({
        url: createJobUrl,
        targetService: this.targetService,
        payload,
        msg: `createJob`,
      });
      const res = await this.post<ICreateJobResponse>(createJobUrl, payload);
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
    const updateJobUrl = `/jobs/${jobId}`;
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
}

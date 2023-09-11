import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { httpClientConfig } from './models/utils';

export class HeartbeatClient extends HttpClient {
  private readonly intervalDictionary: Record<string, NodeJS.Timer | undefined>;
  public constructor(
    protected readonly logger: Logger,
    protected intervalMs: number,
    protected heartbeatBaseUrl: string,
    httpRetryConfig: IHttpRetryConfig | undefined = httpClientConfig,
    targetService: string | undefined = 'heartbeatClient',
    disableDebugLogs: boolean | undefined = true
  ) {
    super(logger, heartbeatBaseUrl, targetService, httpRetryConfig, disableDebugLogs);
    this.intervalDictionary = {};
  }

  public start(taskId: string): void {
    this.logger.info({
      taskId,
      url: this.heartbeatBaseUrl,
      targetService: this.targetService,
      msg: `start heartbeat for taskId=${taskId}`,
    });
    const interval = this.intervalDictionary[taskId];
    if (interval) {
      this.logger.warn({
        taskId,
        msg: `interval for taskId: ${taskId} is not null but it should be null! Maybe there is a bug in the service`,
      });
      clearInterval(interval);
    }
    this.intervalDictionary[taskId] = setInterval(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async () => {
        await this.send(taskId);
      },
      this.intervalMs
    );
  }

  public async stop(taskId: string): Promise<void> {
    this.logger.info({
      taskId,
      url: this.heartbeatBaseUrl,
      targetService: this.targetService,
      msg: `stop heartbeat for taskId=${taskId}`,
    });
    const interval = this.intervalDictionary[taskId];
    if (interval) {
      clearInterval(interval);
      delete this.intervalDictionary[taskId];
    } else {
      this.logger.error({
        taskId,
        msg: `interval for taskId: ${taskId} is not exists but it should exists!`,
      });
    }
    await this.remove(taskId);
  }

  public async send(taskId: string): Promise<void> {
    try {
      const heartbeatUrl = `/heartbeat/${taskId}`;
      await this.post(heartbeatUrl);
    } catch (err) {
      this.logger.error({
        err,
        taskId,
        url: this.heartbeatBaseUrl,
        targetService: this.targetService,
        msg: `send heartbeat failed for taskId=${taskId}`,
        errorMessage: (err as { message: string }).message,
      });
    }
  }

  public async remove(taskId: string): Promise<void> {
    try {
      const heartbeatUrl = `/heartbeat/remove`;
      await this.post(heartbeatUrl, [taskId]);
    } catch (err) {
      this.logger.error({
        err,
        taskId,
        url: this.heartbeatBaseUrl,
        targetService: this.targetService,
        msg: `remove heartbeat failed for taskId=${taskId}`,
        errorMessage: (err as { message: string }).message,
      });
    }
  }
}

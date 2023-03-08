import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { httpClientConfig } from './models/utils';

export class HeartbeatClient extends HttpClient {
  public intervalKey: NodeJS.Timeout | null = null;
  public constructor(
    protected readonly logger: Logger,
    protected intervalMs: number,
    protected heartbeatBaseUrl: string,
    protected httpRetryConfig: IHttpRetryConfig = httpClientConfig,
    protected targetService: string = 'heartbeatClient'
  ) {
    super(logger, heartbeatBaseUrl, targetService, httpRetryConfig, true);
  }

  public start(taskId: string): void {
    this.logger.info({ taskId, url: this.heartbeatBaseUrl, targetService: this.targetService }, `start heartbeat for taskId=${taskId}`);
    if (this.intervalKey !== null) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
    this.intervalKey = setInterval(
      () => {
        void this.send;
      },
      this.intervalMs,
      taskId
    );
  }

  public stop(taskId: string): void {
    this.logger.info({ taskId, url: this.heartbeatBaseUrl, targetService: this.targetService }, `stop heartbeat for taskId=${taskId}`);
    if (this.intervalKey !== null) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
  }

  public async send(taskId: number): Promise<void> {
    try {
      const heartbeatUrl = `/heartbeat/${taskId}`;
      await this.post(heartbeatUrl);
    } catch (err) {
      this.logger.error({ err, taskId, url: this.heartbeatBaseUrl, targetService: this.targetService }, `send heartbeat failed for taskId=${taskId}`);
    }
  }
}

import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { httpClientConfig } from './models/utils';
import { Logger } from '@map-colonies/js-logger';

export class HeartbeatClient extends HttpClient {
  public intervalKey: NodeJS.Timeout | null = null;
  public constructor(
    protected readonly logger: Logger,
    protected intervalMs: number,
    protected heartbeatBaseUrl: string,
    protected httpRetryConfig: IHttpRetryConfig = httpClientConfig
  ) {
    super(logger, heartbeatBaseUrl, 'heartbeatClient', httpRetryConfig);
  }

  public start(taskId: string): void {
    this.logger.info(`[HeartbeatClient][start] taskId=${taskId}`);
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
    this.logger.info(`[HeartbeatClient][stop] taskId=${taskId}`);
    if (this.intervalKey !== null) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
  }

  public async send(taskId: number): Promise<void> {
    try {
      this.logger.debug(`[HeartbeatClient][send] taskId=${taskId}`);
      const heartbeatUrl = `/heartbeat/${taskId}`;
      await this.post(heartbeatUrl);
    } catch (err) {
      this.logger.error(`[HeartbeatClient][send] taskId=${taskId} failed error=${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    }
  }
}

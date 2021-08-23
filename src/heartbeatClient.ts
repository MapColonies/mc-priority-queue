import { ILogger, HttpClient } from '@map-colonies/mc-utils';

export class HeartbeatClient extends HttpClient {
  public intervalKey: NodeJS.Timeout | null = null;
  public constructor(protected readonly logger: ILogger, protected intervalMs: number, protected heartbeatBaseUrl: string) {
    super(logger, heartbeatBaseUrl, 'heartbeatClient', {
      attempts: 3,
      delay: 'exponential',
      shouldResetTimeout: true,
    });
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

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
    this.logger.info(`start heartbit for taskId=${taskId}`);
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
    this.logger.info(`stop heartbit for taskId=${taskId}`);
    if (this.intervalKey !== null) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
  }

  public async send(taskId: number): Promise<void> {
    const logFormat = `taskId=${taskId}`;
    try {
      this.logger.debug(`send heartbit for ${logFormat}`);
      const heartbeatUrl = `/heartbeat/${taskId}`;
      await this.post(heartbeatUrl);
    } catch (err) {
      this.logger.error(`failed to send heartbit ${logFormat}`);
    }
  }
}

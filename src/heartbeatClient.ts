import { ILogger, HttpClient } from '@map-colonies/mc-utils';

export class HeartbeatClient extends HttpClient {
  public intervalKey: any;
  public constructor(protected readonly logger: ILogger, protected intervalMs: number, protected heartbeatBaseUrl: string) {
    super(logger, heartbeatBaseUrl, 'heartbeatClient', {
      attempts: 3,
      delay: 'exponential',
      shouldResetTimeout: true,
    });
  }

  public start(taskId: string) {
    this.logger.info(`start heartbit for taskId=${taskId}`);
    if (this.intervalKey) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
    this.intervalKey = setInterval(this.send, this.intervalMs, taskId);
  }

  public stop(taskId: string) {
    this.logger.info(`stop heartbit for taskId=${taskId}`);
    if (this.intervalKey) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
  }

  public async send(taskId: number) {
    await this.internalSend(taskId);
  }

  public async internalSend(taskId: number): Promise<any> {
    const logFormat = `taskId=${taskId}`;
    try {
      this.logger.debug(`send heartbit for ${logFormat}`);
      const heartbeatUrl = `/heartbeat/${taskId}`;
      const taskResponse = await this.post(heartbeatUrl);
      return taskResponse;
    } catch (err) {
      this.logger.error(`failed to send heartbit ${logFormat}`);
    }
  }
}

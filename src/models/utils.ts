import { IHttpRetryConfig } from '@map-colonies/mc-utils';

export const httpClientConfig: IHttpRetryConfig = {
  attempts: 3,
  delay: 'exponential',
  shouldResetTimeout: true,
};

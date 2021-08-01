// import { ILogger } from '@map-colonies/mc-utils';
// import { ITaskResponse } from './models/dataTypes';
// import { TaskHandler } from './taskHandler';

// const logger: ILogger = {
//   debug: () => {
//     //tachman
//   },
//   info: () => {
//     //tachman
//   },
//   warn: () => {
//     //tachman
//   },
//   error: () => {
//     //tachman
//   },
// };

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
// const taskHandler = new TaskHandler(logger, 'Discrete-Tiling', 'Discrete-Tiling', 'http://localhost:8082', 'http://localhost:8087', 8000);
// void taskHandler.waitForTask().then((task)=> console.log(task)).catch((err)=>console.log(err));

export * from './taskHandler';
export * from './heartbeatClient';
export * from './jobManagerClient';
export * from './models/dataTypes';

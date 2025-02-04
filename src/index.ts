import { WebApp } from '@twa-dev/types';
import { IGetTasksOptions, ITask } from './types';
import Taddy from './taddy';

declare global {
  interface Window {
    Telegram: {
      WebApp: WebApp;
    };
  }
}
export { Taddy, ITask, IGetTasksOptions };

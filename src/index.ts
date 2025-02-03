import { WebApp } from '@twa-dev/types';
import Taddy from './taddy';
declare global {
  interface Window {
    Telegram: {
      WebApp: WebApp;
    };
  }
}
export default Taddy;

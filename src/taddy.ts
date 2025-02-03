import { WebApp } from '@twa-dev/types';

class TaddySDK {
  private webApp: WebApp;
  private initData: WebApp['initDataUnsafe'];
  private readonly user: WebApp['initDataUnsafe']['user'];
  private readonly pubId: string;
  private readonly debug: boolean;

  constructor(pubId: string, debug: boolean = false) {
    this.pubId = pubId;
    this.debug = debug;
    this.webApp = window.Telegram.WebApp;
    this.initData = this.webApp.initDataUnsafe;
    this.user = this.initData.user;
  }

  private logEvent(event: string, payload: Record<string, any> = {}) {
    payload = { ...payload, event, pubId: this.pubId };
    if (this.debug) console.info(`Sending "${event}" event`, payload);
    window
      .fetch(`https://tr.taddy.pro/events`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      .catch((e) => this.debug && console.warn(e));
  }

  ready() {
    this.logEvent('ready', { user: this.user });
  }
}

export default TaddySDK;

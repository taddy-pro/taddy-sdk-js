import { IGetTasksOptions, ITask, TCustomEvent, TEvent, THeaders, THttpMethod, TResponse } from './types';

export class Taddy {
  private webApp: WebApp;
  private initData: WebApp['initDataUnsafe'];
  private readonly user: WebApp['initDataUnsafe']['user'];
  private readonly pubId: string;
  private readonly debug: boolean;
  private isReady: boolean = false;

  constructor(pubId: string, debug: boolean = false) {
    if (!window.Telegram || !window.Telegram.WebApp) throw new Error('Taddy: Telegram WebApp script is not loaded');
    this.pubId = pubId;
    this.debug = debug;
    this.webApp = window.Telegram.WebApp;
    this.initData = this.webApp.initDataUnsafe;
    this.user = this.initData.user;
    // document.addEventListener('DOMContentLoaded', () => this.logEvent('dom-ready'), { once: true });
  }

  private logEvent(event: TEvent, payload: Record<string, any> = {}) {
    payload = { ...payload, event, pubId: this.pubId };
    if (this.debug) console.info(`Taddy: Sending "${event}" event`, payload);
    this.request('POST', '/events', payload).catch((e) => this.debug && console.warn('Taddy:', e));
  }

  customEvent(event: TCustomEvent, options?: { value?: number | null; currency?: string; once?: boolean }) {
    if (this.debug) console.info(`Taddy: Sending "${event}" event`, options);
    this.request('POST', '/events/custom', {
      pubId: this.pubId,
      user: this.user!.id,
      event,
      value: options?.value,
      currency: options?.currency,
      once: options?.once,
    }).catch((e) => this.debug && console.warn('Taddy:', e));
  }

  ready(): void {
    if (!this.isReady) {
      this.logEvent('ready', { user: this.user, start: this.initData.start_param });
      this.isReady = true;
      return;
    }
    console.warn('Taddy: ready() already called');
  }

  tasks = (options?: IGetTasksOptions) => {
    if (!this.isReady) throw new Error('Taddy: ready() not called');
    return this.request<ITask[]>('POST', '/exchange/feed', {
      pubId: this.pubId,
      user: this.user,
      start: this.initData.start_param,
      ...options,
    });
  };

  impressions(tasks: ITask[]): void {
    this.logEvent('impressions', { ids: tasks.map((t) => t.id), user: this.user });
  }

  open(task: ITask, autoCheck: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      this.request<string>('POST', task.link)
        .then((link) => {
          window.Telegram.WebApp.openTelegramLink(link);
          if (autoCheck) {
            let counter = 0;
            const check = () => {
              this.check(task).then((completed) => {
                if (completed) resolve();
                else if (++counter < 100) setTimeout(check, 1000);
                else reject('Check timed out');
              });
            };
            setTimeout(check, 1000);
          } else {
            resolve();
          }
        })
        .catch(reject);
    });
  }

  check(task: ITask): Promise<boolean> {
    return this.request<boolean>('POST', '/exchange/check', { exchangeId: task.id, userId: this.user!.id });
  }

  private request = <T>(
    method: THttpMethod,
    endpoint: string,
    payload: object | FormData = {},
    fields: string[] = [],
  ): Promise<T> => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      const processReject = (error: string, code: number) => {
        if (this.debug) console.error('Taddy: Error', code, error);
        reject(error);
      };

      const options: { method: string; headers: THeaders; body?: FormData | string } = {
        method: method.toUpperCase(),
        headers: {
          accept: 'application/json',
        },
      };

      if (payload instanceof FormData) {
        payload.append('fields', fields.join(','));
        options.body = payload;
      } else {
        options.headers['content-type'] = 'application/json';
        // @ts-ignore
        payload['fields'] = fields;
        if (payload && method !== 'GET') options.body = JSON.stringify(payload);
      }

      if (payload && method === 'GET') {
        const json = JSON.stringify(payload);
        if (json !== '{}') endpoint += '?__payload=' + encodeURIComponent(json);
      }

      if (this.debug)
        console.log('Taddy: Request', method, endpoint.split('?')[0], JSON.parse(JSON.stringify(payload)));

      const url = endpoint.startsWith('https') ? endpoint : `https://t.tadly.pro${endpoint}`;

      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((data: TResponse) => {
              if (data.error) processReject(data.error, response.status);
              else {
                if (this.debug) console.info('Taddy: Result', data.result);
                resolve(data.result);
              }
            })
            .catch((e) => processReject(e, -2));
        })
        .catch((e) => processReject(e, -1));
    });
  };
}

export type TEvent = 'dom-ready' | 'ready' | TCustomEvent | string;

export type TCustomEvent = 'custom1' | 'custom2' | 'custom3' | 'custom4';

export type TIdentifier = number | string;

export type THeaders = Record<string, string>;

export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type TResponse = {
  result?: any;
  error?: string;
  code?: number;
};

export interface ITask {
  id: TIdentifier;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface IGetTasksOptions {
  limit?: number;
  autoImpressions?: boolean;
}

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

  logEvent(event: TEvent, payload: Record<string, any> = {}) {
    payload = { ...payload, event, pubId: this.pubId };
    if (this.debug) console.info(`Sending "${event}" event`, payload);
    this.request('POST', '/events', payload).catch((e) => this.debug && console.warn(e));
  }

  customEvent(event: TCustomEvent, value: number | null = null) {
    this.logEvent(event, { value });
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

  open(task: ITask): Promise<void> {
    return new Promise((resolve, reject) => {
      this.request<string>('POST', task.link)
        .then((link) => {
          window.Telegram.WebApp.openTelegramLink(link);
          let counter = 0;
          const check = () => {
            this.request<boolean>('POST', '/exchange/check', { exchangeId: task.id, userId: this.user!.id }).then(
              (completed) => {
                if (completed) resolve();
                else if (++counter < 100) setTimeout(check, 1000);
                else reject('Check timed out');
              },
            );
          };
          setTimeout(check, 1000);
        })
        .catch(reject);
    });
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
        if (this.debug) console.error('Error', code, error);
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

      if (this.debug) console.log('Request', method, endpoint.split('?')[0], JSON.parse(JSON.stringify(payload)));

      const url = endpoint.startsWith('https') ? endpoint : `https://t.tadly.pro${endpoint}`;

      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((data: TResponse) => {
              if (data.error) processReject(data.error, response.status);
              else {
                if (this.debug) console.info('Result', data.result);
                resolve(data.result);
              }
            })
            .catch((e) => processReject(e, -2));
        })
        .catch((e) => processReject(e, -1));
    });
  };
}

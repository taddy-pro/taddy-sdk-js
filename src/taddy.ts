import { IGetTasksOptions, ITask, TEvent, THeaders, THttpMethod, TResponse } from './types';

class Taddy {
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
    // document.addEventListener('DOMContentLoaded', () => this.logEvent('dom-ready'), { once: true });
  }

  logEvent(event: TEvent, payload: Record<string, any> = {}) {
    payload = { ...payload, event, pubId: this.pubId };
    if (this.debug) console.info(`Sending "${event}" event`, payload);
    this.request('POST', '/events', payload).catch((e) => this.debug && console.warn(e));
  }

  ready(): void {
    this.logEvent('ready', { user: this.user, start: this.initData.start_param });
  }

  tasks = (options?: IGetTasksOptions) =>
    this.request<ITask[]>('POST', '/exchange/feed', {
      pubId: this.pubId,
      user: this.user,
      start: this.initData.start_param,
      ...options,
    });

  impressions(tasks: ITask[]): void {
    this.logEvent('impressions', { ids: tasks.map((t) => t.id), user: this.user });
    // this.request('POST', '/exchange/impressions', {
    //   pubId: this.pubId,
    //   ids: tasks.map((t) => t.id),
    //   user: this.user,
    // }).catch(console.warn);
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

      const url = endpoint.startsWith('https') ? endpoint : `https://tr.taddy.pro${endpoint}`;

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

export default Taddy;

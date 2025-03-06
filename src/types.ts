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

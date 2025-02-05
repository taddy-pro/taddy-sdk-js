export type TEvent = 'dom-ready' | 'ready' | string;

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

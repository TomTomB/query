import {
  Method,
  RequestError,
  QueryParams,
  PathParams,
} from '@tomtomb/query-core';
import { Observable } from 'rxjs';
import { Query } from './query';

export interface QueryConfig<
  Route extends RouteType<Arguments>,
  Response,
  Arguments extends BaseArguments | AnyDynamicArguments | undefined
> {
  method: Method;
  route: Route;
  types?: {
    response?: Response;
    args?: Arguments;
  };
}

export type QueryConfigWithoutMethod<
  Route extends RouteType<Arguments>,
  Response,
  Arguments extends BaseArguments | undefined
> = Omit<QueryConfig<Route, Response, Arguments>, 'method'>;

export interface BaseArguments {
  pathParams?: PathParams;
  queryParams?: QueryParams;
  body?: unknown;
}

export type DynamicArguments<
  T extends BaseArguments | undefined,
  M extends Method
> = QueryArguments &
  IncludePathParams<T> &
  IncludeQueryParams<T> &
  MaybeIncludeBody<T, M>;

export type AnyDynamicArguments = DynamicArguments<BaseArguments, any>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type EmptyObject = {};

export type MaybeIncludeBody<
  T extends BaseArguments | undefined,
  M extends Method
> = M extends 'GET' | 'HEAD' | 'OPTIONS' ? EmptyObject : IncludeBody<T>;

export type IncludePathParams<T extends BaseArguments | undefined> = T extends {
  pathParams: PathParams;
}
  ? WithPathParams<T['pathParams']>
  : EmptyObject;

export type IncludeQueryParams<T extends BaseArguments | undefined> =
  T extends {
    queryParams: QueryParams;
  }
    ? WithQueryParams<T['queryParams']>
    : EmptyObject;

export type IncludeBody<T extends BaseArguments | undefined> = T extends {
  body: unknown;
}
  ? WithBody<T['body']>
  : EmptyObject;

export interface QueryArguments {
  headers?: Record<string, string>;
}

export interface WithPathParams<T extends PathParams> {
  pathParams: T;
}

export interface WithQueryParams<T extends QueryParams> {
  queryParams: T;
}

export interface WithBody<T> {
  body: T;
}

export interface RunQueryOptions {
  skipCache?: boolean;
  abortPrevious?: boolean;
}

export type RouteType<
  Arguments extends BaseArguments | AnyDynamicArguments | undefined
> = Arguments extends {
  pathParams: infer PathParams;
}
  ? (p: PathParams) => RouteString
  : RouteString;

export type RouteString = `/${string}`;

export interface PollConfig {
  interval: number;
  takeUntil: Observable<unknown>;
}

export const enum QueryStateType {
  Prepared = 'PREPARED',
  Loading = 'LOADING',
  Success = 'SUCCESS',
  Failure = 'FAILURE',
  Cancelled = 'CANCELLED',
}

export interface Prepared {
  readonly type: QueryStateType.Prepared;
  readonly meta: QueryStateMeta;
}

export interface Success<T = unknown> {
  readonly type: QueryStateType.Success;
  readonly response: T;
  readonly meta: QueryStateSuccessMeta;
}

export interface Failure {
  readonly type: QueryStateType.Failure;
  readonly error: RequestError;
  readonly meta: QueryStateMeta;
}

export interface Loading {
  readonly type: QueryStateType.Loading;
  readonly meta: QueryStateMeta;
}

export interface Cancelled {
  readonly type: QueryStateType.Cancelled;
  readonly meta: QueryStateMeta;
}

export interface QueryStateMeta {
  readonly id: number;
}

export interface QueryStateSuccessMeta extends QueryStateMeta {
  readonly expiresAt: number | null;
}

export type QueryState<Data = unknown> =
  | Loading
  | Success<Data>
  | Failure
  | Cancelled
  | Prepared;

export type QueryStateData<T extends QueryState = QueryState> =
  T extends Success<infer X> ? X : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyQuery = Query<any, any, any>;

export type QueryType<T extends { prepare: () => AnyQuery }> =
  T['prepare'] extends () => infer R ? R : never;

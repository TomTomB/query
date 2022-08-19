import { Method, RequestError, UnfilteredParams } from '@tomtomb/query-core';
import { Observable } from 'rxjs';
import { Query } from './query';

export interface QueryConfig<
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | unknown = unknown
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
  Response = unknown,
  Arguments extends BaseArguments | unknown = unknown
> = Omit<QueryConfig<Route, Response, Arguments>, 'method'>;

export interface BaseArguments {
  pathParams?: Record<string, string | number>;
  queryParams?: UnfilteredParams;
  body?: unknown;
}

export interface RunQueryOptions {
  skipCache?: boolean;
  abortPrevious?: boolean;
}

export type RouteType<Arguments = unknown> = Arguments extends {
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

export interface BaseArguments {
  pathParams?: Record<string, string | number>;
  queryParams?: UnfilteredParams;
  body?: unknown;
}

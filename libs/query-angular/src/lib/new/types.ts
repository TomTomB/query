import {
  BaseArguments,
  Method,
  RequestError,
  UnfilteredParams,
} from '@tomtomb/query-core';
import { Observable } from 'rxjs';

type PathParams = Record<string, string | number>;
export type QueryParams = UnfilteredParams;

export interface CreateQueryConfig {
  route: string;
  method: Method;
}

export type CreateQueryConfigWithoutMethod = Omit<CreateQueryConfig, 'method'>;

export interface PrepareQueryConfig<T extends BaseArguments | void> {
  args: T;
  options?: RunQueryOptions;
}

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

export interface RunQueryOptions {
  skipCache?: boolean;
  abortPrevious?: boolean;
}

export type QueryState<Data = unknown> =
  | Loading
  | Success<Data>
  | Failure
  | Cancelled
  | Prepared;

export type QueryStateData<T extends QueryState = QueryState> =
  T extends Success<infer X> ? X : never;

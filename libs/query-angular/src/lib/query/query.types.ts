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
  Arguments extends BaseArguments | undefined
> {
  /**
   * The http method to use for the query.
   */
  method: Method;

  /**
   * The api route to use for the query.
   */
  route: Route;

  /**
   * Determines if the auth provider should be used for this query.
   * The query **will throw** if the query client's auth provider is unset.
   */
  secure?: boolean;

  /**
   * Object containing the query's type information.
   */
  types?: {
    /**
     * The type of the successful response.
     */
    response?: Response;

    /**
     * Arguments for executing the query.
     *
     * - `pathParams`: The path parameters for the query. (in front of the ? in the url)
     * - `queryParams`: The query parameters for the query. (after the ? in the url)
     * - `body`: The body for the query. Unavailable for GET, HEAD and OPTIONS requests.
     * - `headers`: The headers for the query.
     */
    args?: Arguments;
  };
}

export interface GqlQueryConfig<
  Route extends RouteType<Arguments> | undefined,
  Response,
  Arguments extends BaseArguments | undefined
> {
  method: Method;
  query: string;
  route?: Route;
  secure?: boolean;
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

export type GqlQueryConfigWithoutMethod<
  Route extends RouteType<Arguments>,
  Response,
  Arguments extends BaseArguments | undefined
> = Omit<GqlQueryConfig<Route, Response, Arguments>, 'method'>;

export interface BaseArguments extends WithHeaders {
  pathParams?: PathParams;
  queryParams?: QueryParams;
  body?: unknown;
  variables?: Record<string, unknown>;
}

export interface WithHeaders {
  headers?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type EmptyObject = {};

export interface RunQueryOptions {
  skipCache?: boolean;
}

export type RouteType<Arguments extends BaseArguments | undefined> =
  Arguments extends {
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
export type AnyQuery = Query<any, any, any, any>;

export type QueryType<
  T extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare: (args: any) => AnyQuery;
  }
> = T['prepare'] extends () => infer R
  ? R
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T['prepare'] extends (args: any) => infer R
  ? R
  : never;

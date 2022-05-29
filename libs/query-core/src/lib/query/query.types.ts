import { QueryClientConfig } from '../query-client';
import { QueryState } from '../query-state';
import { Method, UnfilteredParams } from '../request';

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

export type Query<
  Arguments extends BaseArguments | void,
  Response = unknown
> = { doStuff: () => boolean } & {
  execute: Arguments extends void
    ? (options?: RunQueryOptions) => Promise<Response>
    : (args: Arguments, options?: RunQueryOptions) => Promise<Response>;
};

export type RouteType<Arguments = unknown> = Arguments extends {
  pathParams: infer PathParams;
}
  ? (p: PathParams) => string
  : string;

export interface CombinedQueryConfig<
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | unknown = unknown
> {
  client: QueryClientConfig;
  query: QueryConfig<Route, Response, Arguments>;
  state: QueryState;
}

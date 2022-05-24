import { MethodType, UnfilteredParams } from '../request';

export interface QueryConfig<
  Method extends MethodType,
  Name extends string,
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | unknown = unknown
> {
  method: Method;
  name: Name;
  route: Route;
  types?: {
    response?: Response;
    args?: Arguments;
  };
}

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
  Name extends string,
  Arguments extends BaseArguments | void,
  Response = unknown
> = { doStuff: () => boolean } & {
  [key in Name]: Arguments extends void
    ? (options?: RunQueryOptions) => Promise<Response>
    : (args: Arguments, options?: RunQueryOptions) => Promise<Response>;
};

export type RouteType<Arguments = unknown> = Arguments extends {
  pathParams: infer PathParams;
}
  ? (p: PathParams) => string
  : string;

import { QueryState } from '../query-state';
import { UnfilteredParams } from '../request';

export interface QueryBaseArguments {
  isPaginated?: boolean;
  queryParams?: UnfilteredParams;
  pathParams?: Record<string, unknown>;
}

export interface InitializeQueryConfig {
  baseRoute: string;
}

export interface RunQueryConfig<
  Arguments extends QueryBaseArguments | unknown
> {
  route: RouteFn<Arguments>;
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS'
    | 'TRACE'
    | 'CONNECT'
    | 'PURGE'
    | 'LINK'
    | 'UNLINK'
    | 'CUSTOM';
}

export type RouteFn<Arguments extends QueryBaseArguments | unknown> =
  Arguments extends QueryBaseArguments
    ? (args: Arguments['pathParams']) => string
    : string;

export interface ExecuteConfig<Arguments extends QueryBaseArguments | unknown> {
  args: Arguments;
  options?: ExecuteOptions | undefined;
}

export type ExecuteConfigWithoutArgs = Omit<ExecuteConfig<unknown>, 'args'>;

export type ExecuteOptions = {
  skipCache?: boolean;
  abortPrevious?: boolean;
};

export interface Query {
  create: <
    Response = unknown,
    Arguments extends QueryBaseArguments | unknown = unknown,
    ErrorResponse = unknown
  >(
    config: RunQueryConfig<Arguments>
  ) => ReturnType<CreateQuery<Response, Arguments, ErrorResponse>>;
}

export type CreateQuery<
  Response = unknown,
  Arguments extends QueryBaseArguments | unknown = unknown,
  ErrorResponse = unknown
> = (
  config: RunQueryConfig<Arguments>,
  queryState: QueryState,
  queryOptions: InitializeQueryConfig
) => {
  execute: Arguments extends QueryBaseArguments
    ? (config: ExecuteConfig<Arguments>) => Promise<Response>
    : (config?: ExecuteConfigWithoutArgs) => Promise<Response>;
};

export interface QueryBaseArguments {
  isPaginated?: boolean;
  queryParams?: Record<string, unknown>;
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
    ? (args: Arguments['queryParams']) => string
    : string;

export interface ExecuteConfig<Arguments extends QueryBaseArguments | unknown> {
  args: Arguments;
  options?: ExecuteOptions | undefined;
}

export type ExecuteConfigWithoutArgs = Omit<ExecuteConfig<unknown>, 'args'>;

export type ExecuteOptions = Record<string, unknown>;

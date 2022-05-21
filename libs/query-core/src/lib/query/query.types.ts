import { QueryState } from '../query-state';
import { UnfilteredParams, CacheAdapterFn } from '../request';

export interface InitializeQueryConfig {
  /**
   * The api base route.
   * @example 'https://api.example.com'
   */
  baseRoute: string;

  /**
   * Logging configuration for debugging.
   */
  logging?: {
    /**
     * Log all query state changes.
     */
    queryStateChanges?: boolean;

    /**
     * Log query state garbage collector runs.
     */
    queryStateGarbageCollector?: boolean;
  };

  /**
   * Request options.
   */
  request?: {
    /**
     * Adapter function used for extracting the time until the response is invalid.
     * The default uses the `cache-control` (`max-age` & `s-maxage`), `age` and `expires` headers.
     * Should return a number in seconds.
     */
    cacheAdapter?: CacheAdapterFn;
  };
}

export interface QueryBaseArguments {
  isPaginated?: boolean;
  queryParams?: UnfilteredParams;
  pathParams?: Record<string, unknown>;
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
    Arguments extends QueryBaseArguments | unknown = unknown
  >(
    config: RunQueryConfig<Arguments>
  ) => ReturnType<CreateQuery<Response, Arguments>>;
}

export type CreateQuery<
  Response = unknown,
  Arguments extends QueryBaseArguments | unknown = unknown
> = (
  config: RunQueryConfig<Arguments>,
  queryState: QueryState,
  queryOptions: InitializeQueryConfig
) => {
  execute: ExecuteFn<Response, Arguments>;
};

export type ExecuteFn<
  Response = unknown,
  Arguments extends QueryBaseArguments | unknown = unknown
> = Arguments extends QueryBaseArguments
  ? (config: ExecuteConfig<Arguments>) => Promise<Response>
  : (config?: ExecuteConfigWithoutArgs) => Promise<Response>;

import { CacheAdapterFn, Method as MethodType } from '@tomtomb/query-core';
import { BehaviorSubject } from 'rxjs';
import { Query } from '../query/query';
import { BaseArguments, RouteType } from '../query/query.types';

export interface QueryClientConfig {
  /**
   * The api base route.
   * @example 'https://api.example.com'
   */
  baseRoute: `https://${string}` | `http://localhost:${string}`;

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

export type QueryCreator<
  Arguments extends BaseArguments | undefined,
  Method extends MethodType,
  Response,
  Route extends RouteType<Arguments>
> = (Arguments extends { pathParams: unknown }
  ? {
      prepare: (args: Arguments) => Query<Response, Arguments, Route, Method>;
    }
  : {
      prepare: (args?: Arguments) => Query<Response, Arguments, Route, Method>;
    }) & {
  behaviorSubject: <T extends Query<Response, Arguments, Route, Method>>(
    initialValue?: T | null
  ) => BehaviorSubject<T | null>;
};

export type AnyQueryCreator = QueryCreator<any, any, any, any>;

export type QueryCreatorArgs<T extends AnyQueryCreator> = Parameters<
  T['prepare']
>[0];

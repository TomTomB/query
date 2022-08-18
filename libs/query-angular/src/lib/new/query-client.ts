import {
  BaseArguments,
  buildRoute,
  Method,
  QueryClientConfig,
  QueryConfigWithoutMethod,
  RouteType,
} from '@tomtomb/query-core';
import { Query } from './query';
import { QueryStore2 } from './query-store';
import {
  CreateQueryConfig,
  CreateQueryConfigWithoutMethod,
  PrepareQueryConfig,
  RunQueryOptions,
} from './types';

export class QueryClient {
  private readonly _store: QueryStore2;

  constructor(private _clientConfig: QueryClientConfig) {
    this._store = new QueryStore2({
      enableChangeLogging: _clientConfig.logging?.queryStateChanges,
      enableGarbageCollectorLogging:
        _clientConfig.logging?.queryStateGarbageCollector,
    });
  }

  get = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments>({
      ...queryConfig,
      method: 'GET',
    });

  post = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments>({
      ...queryConfig,
      method: 'POST',
    });

  put = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments>({
      ...queryConfig,
      method: 'PUT',
    });

  patch = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments>({
      ...queryConfig,
      method: 'PATCH',
    });

  delete = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments>({
      ...queryConfig,
      method: 'DELETE',
    });

  fetch = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    queryConfig: CreateQueryConfig
  ) => {
    return {
      prepare: (args?: Arguments, options?: RunQueryOptions) => {
        const route = buildRoute({
          base: this._clientConfig.baseRoute,
          route: queryConfig.route,
          pathParams: args?.pathParams,
          queryParams: args?.queryParams,
        }) as Route;

        // Caching should only be enabled for GET requests.
        if (this._shouldCache(queryConfig.method)) {
          const existingQuery = this._store.get(route);

          if (existingQuery) {
            return existingQuery as Query<Route, Response, Arguments>;
          }
        }

        const query = new Query<Route, Response, Arguments>(
          this._clientConfig,
          queryConfig,
          args,
          options,
          route,
          this._store
        );

        if (this._shouldCache(queryConfig.method)) {
          this._store.add(route, query);
        }

        return query;
      },
    };
  };

  private _shouldCache(method: Method) {
    return method === 'GET' || method === 'OPTIONS' || method === 'HEAD';
  }
}

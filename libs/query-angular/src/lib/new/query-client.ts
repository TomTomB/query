import {
  BaseArguments,
  buildRoute,
  Method,
  QueryClientConfig,
  QueryConfig,
  QueryConfigWithoutMethod,
  RouteType,
} from '@tomtomb/query-core';
import { Query } from './query';
import { QueryStore2 } from './query-store';
import { RunQueryOptions } from './types';

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
    queryConfig: QueryConfig<Route, Response, Arguments>
  ) => {
    return {
      prepare: (args?: Arguments) => {
        const route = buildRoute({
          base: this._clientConfig.baseRoute,
          route: queryConfig.route,
          pathParams: args?.pathParams,
          queryParams: args?.queryParams,
        }) as Route;

        if (this._shouldCache(queryConfig.method)) {
          const existingQuery = this._store.get(route);

          if (existingQuery) {
            return existingQuery as Query<Route, Response, Arguments>;
          }
        }

        const query = new Query<Route, Response, Arguments>(
          this._clientConfig,
          queryConfig,
          route,
          args
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

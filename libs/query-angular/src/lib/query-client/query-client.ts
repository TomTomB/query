import { buildRoute } from '@tomtomb/query-core';
import { BehaviorSubject } from 'rxjs';
import {
  BaseArguments,
  Query,
  QueryConfig,
  QueryConfigWithoutMethod,
  RouteType,
} from '../query';
import { QueryStore } from '../query-store';
import { QueryClientConfig } from './query-client.types';
import { shouldCacheQuery } from './query-client.utils';

export class QueryClient {
  private readonly _store: QueryStore;

  constructor(private _clientConfig: QueryClientConfig) {
    this._store = new QueryStore({
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
    const prepare = (args?: Arguments) => {
      const route = buildRoute({
        base: this._clientConfig.baseRoute,
        route: queryConfig.route,
        pathParams: args?.pathParams,
        queryParams: args?.queryParams,
      }) as Route;

      if (shouldCacheQuery(queryConfig.method)) {
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

      if (shouldCacheQuery(queryConfig.method)) {
        this._store.add(route, query);
      }

      return query;
    };

    const behaviorSubject = <T extends ReturnType<typeof prepare>>(
      initialValue: T | null = null
    ) => new BehaviorSubject<T | null>(initialValue);

    return {
      prepare,
      behaviorSubject,
    };
  };
}

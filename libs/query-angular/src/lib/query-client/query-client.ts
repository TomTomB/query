import { buildRoute, Method as MethodType } from '@tomtomb/query-core';
import { BehaviorSubject } from 'rxjs';
import { AuthProvider } from '../auth';
import {
  BaseArguments,
  DynamicArguments,
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
  private _authProvider: AuthProvider | null = null;

  get config() {
    return this._clientConfig;
  }

  get authProvider() {
    return this._authProvider;
  }

  constructor(private _clientConfig: QueryClientConfig) {
    this._store = new QueryStore({
      enableChangeLogging: _clientConfig.logging?.queryStateChanges,
      enableGarbageCollectorLogging:
        _clientConfig.logging?.queryStateGarbageCollector,
    });
  }

  get = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'GET'>({
      ...queryConfig,
      method: 'GET',
    });

  post = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'POST'>({
      ...queryConfig,
      method: 'POST',
    });

  put = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'PUT'>({
      ...queryConfig,
      method: 'PUT',
    });

  patch = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'PATCH'>({
      ...queryConfig,
      method: 'PATCH',
    });

  delete = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'DELETE'>({
      ...queryConfig,
      method: 'DELETE',
    });

  fetch = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined,
    Method extends MethodType
  >(
    queryConfig: QueryConfig<Route, Response, Arguments>
  ) => {
    const prepare = <
      Args extends DynamicArguments<Arguments, Method>,
      R extends RouteType<Args>,
      Cfg extends QueryConfig<R, Response, Args>
    >(
      args?: Args
    ) => {
      const route = buildRoute({
        base: this._clientConfig.baseRoute,
        route: queryConfig.route,
        pathParams: (args as BaseArguments)?.pathParams,
        queryParams: (args as BaseArguments)?.queryParams,
      }) as Route;

      if (shouldCacheQuery(queryConfig.method)) {
        const existingQuery = this._store.get(route);

        if (existingQuery) {
          return existingQuery as Query<R, Response, Args>;
        }
      }

      const query = new Query<R, Response, Args>(
        this,
        queryConfig as unknown as Cfg,
        route as unknown as R,
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

  setAuthProvider = (authProvider: AuthProvider) => {
    if (this._authProvider) {
      throw new Error(
        'The auth provider is already set. Please call clearAuthProvider() first.'
      );
    }

    this._authProvider = authProvider;
    authProvider.queryClient = this;
  };

  clearAuthProvider = () => {
    this._authProvider?.cleanUp();
    this._authProvider = null;
  };
}

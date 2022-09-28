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

export type QueryCreator<
  Arguments extends BaseArguments | undefined,
  Method extends MethodType,
  Response,
  Route extends RouteType<Arguments>
> = {
  prepare: <
    DynamicArgs extends DynamicArguments<Arguments, Method>,
    DynamicRoute extends RouteType<DynamicArgs>
  >(
    args: DynamicArgs
  ) => Query<DynamicRoute, Response, DynamicArgs, Arguments, Route, Method>;

  behaviorSubject: <
    T extends Query<
      RouteType<DynamicArguments<Arguments, Method>>,
      Response,
      DynamicArguments<Arguments, Method>,
      Arguments,
      Route,
      Method
    >
  >(
    initialValue?: T | null
  ) => BehaviorSubject<T | null>;
};

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
  ): QueryCreator<Arguments, Method, Response, Route> => {
    const prepare = <
      DynamicArgs extends DynamicArguments<Arguments, Method>,
      DynamicRoute extends RouteType<DynamicArgs>
    >(
      args?: DynamicArgs
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
          return existingQuery as Query<
            DynamicRoute,
            Response,
            DynamicArgs,
            Arguments,
            Route,
            Method
          >;
        }
      }

      const query = new Query<
        DynamicRoute,
        Response,
        DynamicArgs,
        Arguments,
        Route,
        Method
      >(
        this,
        queryConfig as unknown as QueryConfig<Route, Response, Arguments>,
        route as unknown as DynamicRoute,
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

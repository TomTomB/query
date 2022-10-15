import { buildRoute, Method as MethodType } from '@tomtomb/query-core';
import { BehaviorSubject } from 'rxjs';
import { AuthProvider } from '../auth';
import {
  BaseArguments,
  GqlQueryConfig,
  GqlQueryConfigWithoutMethod,
  Query,
  QueryConfig,
  QueryConfigWithoutMethod,
  RouteType,
} from '../query';
import { QueryStore } from '../query-store';
import { QueryClientConfig, QueryCreator } from './query-client.types';
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

  gqlQuery = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: GqlQueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'GQL_QUERY'>({
      ...queryConfig,
      method: 'GQL_QUERY',
    });

  gqlMutate = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined
  >(
    queryConfig: GqlQueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    this.fetch<Route, Response, Arguments, 'GQL_MUTATE'>({
      ...queryConfig,
      method: 'GQL_MUTATE',
    });

  fetch = <
    Route extends RouteType<Arguments>,
    Response,
    Arguments extends BaseArguments | undefined,
    Method extends MethodType
  >(
    queryConfig:
      | QueryConfig<Route, Response, Arguments>
      | GqlQueryConfig<Route, Response, Arguments>
  ): QueryCreator<Arguments, Method, Response, Route> => {
    const prepare = (args?: Arguments) => {
      const route = buildRoute({
        base: this._clientConfig.baseRoute,
        route: queryConfig.route ?? '/',
        pathParams: (args as BaseArguments)?.pathParams,
        queryParams: (args as BaseArguments)?.queryParams,
      }) as Route;

      if (shouldCacheQuery(queryConfig.method)) {
        const existingQuery = this._store.get(route);

        if (existingQuery) {
          return existingQuery as Query<Response, Arguments, Route, Method>;
        }
      }

      const query = new Query<Response, Arguments, Route, Method>(
        this,
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
    } as unknown as QueryCreator<Arguments, Method, Response, Route>;
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

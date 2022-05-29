import { invalidBaseRouteError } from '../logger';
import { QueryState } from '../query-state';
import { Method } from '../request';
import {
  BaseArguments,
  QueryConfig,
  RouteType,
  createQuery,
  QueryConfigWithoutMethod,
} from '../query';
import { QueryClientConfig } from './query-client.types';

export class QueryClient {
  readonly #_queryState;
  readonly #_config;

  constructor(config: QueryClientConfig) {
    if (config.baseRoute.endsWith('/')) {
      throw invalidBaseRouteError(config.baseRoute);
    }

    this.#_config = config;
    this.#_queryState = this.#_initializeQueryState(config);
  }

  get = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>({
      client: this.#_config,
      query: { ...config, method: 'GET' },
      state: this.#_queryState,
    });

  post = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>({
      client: this.#_config,
      query: { ...config, method: 'POST' },
      state: this.#_queryState,
    });

  put = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>({
      client: this.#_config,
      query: { ...config, method: 'PUT' },
      state: this.#_queryState,
    });

  patch = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>({
      client: this.#_config,
      query: { ...config, method: 'PATCH' },
      state: this.#_queryState,
    });

  delete = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>({
      client: this.#_config,
      query: { ...config, method: 'DELETE' },
      state: this.#_queryState,
    });

  fetch = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfig<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>({
      client: this.#_config,
      query: config,
      state: this.#_queryState,
    });

  #_initializeQueryState(config: QueryClientConfig) {
    return new QueryState({
      enableChangeLogging: config.logging?.queryStateChanges,
      enableGarbageCollectorLogging: config.logging?.queryStateGarbageCollector,
    });
  }
}

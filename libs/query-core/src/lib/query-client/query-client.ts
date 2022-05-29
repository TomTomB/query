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
    createQuery<Route, Response, Arguments>(
      { ...config, method: 'GET' },
      this.#_queryState,
      this.#_config
    );

  post = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>(
      { ...config, method: 'POST' },
      this.#_queryState,
      this.#_config
    );

  put = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>(
      { ...config, method: 'PUT' },
      this.#_queryState,
      this.#_config
    );

  patch = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>(
      { ...config, method: 'PATCH' },
      this.#_queryState,
      this.#_config
    );

  delete = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfigWithoutMethod<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>(
      { ...config, method: 'DELETE' },
      this.#_queryState,
      this.#_config
    );

  fetch = <
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfig<Route, Response, Arguments>
  ) =>
    createQuery<Route, Response, Arguments>(
      config,
      this.#_queryState,
      this.#_config
    );

  #_initializeQueryState(config: QueryClientConfig) {
    return new QueryState({
      enableChangeLogging: config.logging?.queryStateChanges,
      enableGarbageCollectorLogging: config.logging?.queryStateGarbageCollector,
    });
  }
}

import { invalidBaseRouteError } from '../logger';
import { QueryState } from '../query-state';
import { MethodType } from '../request';
import { BaseArguments, QueryConfig, RouteType, createQuery } from '../query';
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

  create = <
    Method extends MethodType,
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfig<Method, Route, Response, Arguments>
  ) =>
    createQuery<Method, Route, Response, Arguments>(
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

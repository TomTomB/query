import { invalidBaseRouteError } from '../logger';
import { QueryState } from '../query-state';
import { InitializeQueryConfig } from '../query/query.types';
import { createQuery } from './query';
import {
  BaseArguments,
  MethodType,
  QueryConfig,
  RouteType,
} from './query.types';

export class QueryClient {
  private readonly _queryState;

  constructor(private _config: InitializeQueryConfig) {
    if (_config.baseRoute.endsWith('/')) {
      throw invalidBaseRouteError(_config.baseRoute);
    }

    this._queryState = this._initializeQueryState(_config);
  }

  create = <
    Method extends MethodType,
    Name extends string,
    FullName extends `${Lowercase<Method>}${Name}`,
    Route extends RouteType<Arguments>,
    Response = unknown,
    Arguments extends BaseArguments | void = void
  >(
    config: QueryConfig<Method, Name, Route, Response, Arguments>
  ) =>
    createQuery<Method, Name, FullName, Route, Response, Arguments>(
      config,
      this._queryState,
      this._config
    );

  private _initializeQueryState(config: InitializeQueryConfig) {
    return new QueryState({
      enableChangeLogging: config.logging?.queryStateChanges,
      enableGarbageCollectorLogging: config.logging?.queryStateGarbageCollector,
    });
  }
}

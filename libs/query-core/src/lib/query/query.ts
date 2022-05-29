import {
  isQueryStateExpired,
  isQueryStateLoadingItem,
  isQueryStateSuccessItem,
} from '../query-state';
import {
  buildRoute,
  isAbortRequestError,
  isRequestError,
  request,
} from '../request';
import {
  BaseArguments,
  Query,
  RunQueryOptions,
  RouteType,
  CombinedQueryConfig,
} from './query.types';

export const execute = <
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | void = void
>(
  config: CombinedQueryConfig<Route, Response, Arguments>,
  args?: Arguments,
  options?: RunQueryOptions
) => {
  const pathParams = args?.pathParams;
  const queryParams = args?.queryParams;

  const route = buildRoute({
    base: config.client.baseRoute,
    route: config.query.route,
    pathParams,
    queryParams,
  });

  const existingQuery = config.state.get(route);

  if (isQueryStateLoadingItem(existingQuery)) {
    if (options?.abortPrevious) {
      existingQuery.abortController.abort();
      config.state.delete(route);
    } else {
      return existingQuery.promise;
    }
  }

  if (
    isQueryStateSuccessItem(existingQuery) &&
    !isQueryStateExpired(existingQuery) &&
    !options?.skipCache
  ) {
    return existingQuery.data;
  }

  const abortController = new AbortController();

  const queryPromise = new Promise<Response>((resolve, reject) => {
    request<Response>({
      route,
      init: { method: config.query.method, signal: abortController.signal },
      cacheAdapter: config.client.request?.cacheAdapter,
    })
      .then(({ data, expiresInTimestamp }) => {
        config.state.transformToSuccessState(route, data, expiresInTimestamp);

        resolve(data);
      })
      .catch((error) => {
        if (isAbortRequestError(error)) {
          return;
        }

        if (isRequestError(error)) {
          config.state.transformToErrorState(route, error);
          reject(error);
        }
      });
  });

  config.state.insertLoadingState(route, {
    promise: queryPromise,
    abortController,
  });

  return queryPromise;
};

export const createQuery = <
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | void = void
>(
  config: CombinedQueryConfig<Route, Response, Arguments>
) => {
  const doStuff = () => true;

  const query = {
    execute: (args?: Arguments, options?: RunQueryOptions) =>
      execute(config, args, options),
    doStuff,
  } as Query<Arguments, Response>;

  return query;
};

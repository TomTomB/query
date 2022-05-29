import { QueryClientConfig } from '../query-client';
import {
  isQueryStateExpired,
  isQueryStateLoadingItem,
  isQueryStateSuccessItem,
  QueryState,
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
  QueryConfig,
  RunQueryOptions,
  RouteType,
} from './query.types';

export const createQuery = <
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | void = void
>(
  config: QueryConfig<Route, Response, Arguments>,
  queryState: QueryState,
  queryClientConfig: QueryClientConfig
) => {
  const doStuff = () => true;

  const query = {
    execute: (args?: Arguments, options?: RunQueryOptions) => {
      const pathParams = args?.pathParams;
      const queryParams = args?.queryParams;

      const route = buildRoute({
        base: queryClientConfig.baseRoute,
        route: config.route,
        pathParams,
        queryParams,
      });

      const existingQuery = queryState.get(route);

      if (isQueryStateLoadingItem(existingQuery)) {
        if (options?.abortPrevious) {
          existingQuery.abortController.abort();
          queryState.delete(route);
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
          init: { method: config.method, signal: abortController.signal },
          cacheAdapter: queryClientConfig.request?.cacheAdapter,
        })
          .then(({ data, expiresInTimestamp }) => {
            queryState.transformToSuccessState(route, data, expiresInTimestamp);

            resolve(data);
          })
          .catch((error) => {
            if (isAbortRequestError(error)) {
              return;
            }

            if (isRequestError(error)) {
              queryState.transformToErrorState(route, error);
              reject(error);
            }
          });
      });

      queryState.insertLoadingState(route, {
        promise: queryPromise,
        abortController,
      });

      return queryPromise;
    },
    doStuff,
  } as Query<Arguments, Response>;

  return query;
};

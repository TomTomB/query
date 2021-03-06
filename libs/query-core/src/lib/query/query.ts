import { invalidBaseRouteError } from '../logger';
import {
  isQueryStateExpired,
  isQueryStateLoadingItem,
  isQueryStateSuccessItem,
  QueryState,
} from '../query-state';
import {
  buildRoute,
  isRequestError,
  request,
  isAbortRequestError,
} from '../request';
import {
  ExecuteFn,
  InitializeQueryConfig,
  Query,
  QueryBaseArguments,
  RunQueryConfig,
} from './query.types';
import { executeConfigIsWithArgs } from './query.util';

const createQuery = <
  Response = unknown,
  Arguments extends QueryBaseArguments | unknown = unknown
>(
  config: RunQueryConfig<Arguments>,
  queryState: QueryState,
  queryOptions: InitializeQueryConfig
) => {
  return {
    execute: async (execConfig) => {
      const pathParams = executeConfigIsWithArgs(execConfig)
        ? execConfig.args.pathParams
        : undefined;

      const queryParams = executeConfigIsWithArgs(execConfig)
        ? execConfig.args.queryParams
        : undefined;

      const route = buildRoute({
        base: queryOptions.baseRoute,
        route: config.route,
        pathParams,
        queryParams,
      });

      const existingQuery = queryState.get(route);

      if (isQueryStateLoadingItem(existingQuery)) {
        if (execConfig?.options?.abortPrevious) {
          existingQuery.abortController.abort();
          queryState.delete(route);
        } else {
          return existingQuery.promise;
        }
      }

      if (
        isQueryStateSuccessItem(existingQuery) &&
        !isQueryStateExpired(existingQuery) &&
        !execConfig?.options?.skipCache
      ) {
        return existingQuery.data;
      }

      const abortController = new AbortController();

      const queryPromise = new Promise<Response>((resolve, reject) => {
        request<Response>({
          route,
          init: { method: config.method, signal: abortController.signal },
          cacheAdapter: queryOptions.request?.cacheAdapter,
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
  } as {
    execute: ExecuteFn<Response, Arguments>;
  };
};

export const initializeQuery = (config: InitializeQueryConfig): Query => {
  const QUERY_STATE = new QueryState({
    enableChangeLogging: config.logging?.queryStateChanges,
    enableGarbageCollectorLogging: config.logging?.queryStateGarbageCollector,
  });

  if (config.baseRoute.endsWith('/')) {
    throw invalidBaseRouteError(config.baseRoute);
  }

  const QUERY_OPTIONS = {
    baseRoute: config.baseRoute,
    request: config.request,
  };

  return {
    create: (config) => createQuery(config, QUERY_STATE, QUERY_OPTIONS),
  };
};

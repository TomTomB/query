import { invalidBaseRouteError } from '../logger';
import {
  isQueryStateExpired,
  isQueryStateLoadingItem,
  isQueryStateSuccessItem,
  QueryState,
} from '../query-state';
import { buildRoute, request, RequestError } from '../request';
import {
  ExecuteConfig,
  ExecuteConfigWithoutArgs,
  InitializeQueryConfig,
  Query,
  QueryBaseArguments,
  RunQueryConfig,
} from './query.types';
import { executeConfigIsWithArgs, QueryPromise } from './query.util';

const createQuery = <
  Response = unknown,
  Arguments extends QueryBaseArguments | unknown = unknown,
  ErrorResponse = unknown
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

      const queryPromise = new QueryPromise<
        Response,
        RequestError<ErrorResponse>
      >(async (resolve, reject) => {
        try {
          const result = await request<Response, ErrorResponse>({
            route,
            init: { method: config.method },
          });

          resolve(result);
        } catch (error) {
          reject(error as RequestError<ErrorResponse>);
        }
      });

      return queryPromise;
    },
  } as {
    execute: Arguments extends QueryBaseArguments
      ? (
          config: ExecuteConfig<Arguments>
        ) => QueryPromise<Response, RequestError<ErrorResponse>>
      : (
          config?: ExecuteConfigWithoutArgs
        ) => QueryPromise<Response, RequestError<ErrorResponse>>;
  };
};

export const initializeQuery = (config: InitializeQueryConfig): Query => {
  const QUERY_STATE = new QueryState();

  if (config.baseRoute.endsWith('/')) {
    throw invalidBaseRouteError(config.baseRoute);
  }

  const QUERY_OPTIONS = {
    baseRoute: config.baseRoute,
  };

  return {
    create: (config) => createQuery(config, QUERY_STATE, QUERY_OPTIONS),
  };
};

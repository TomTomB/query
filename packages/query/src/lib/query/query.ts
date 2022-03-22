import { invalidBaseRouteError } from '../logger';
import {
  isQueryStateExpired,
  isQueryStateLoadingItem,
  isQueryStateSuccessItem,
  QueryState,
} from '../query-state';
import { buildRoute, request } from '../request';
import { CreateQuery, InitializeQueryConfig, Query } from './query.types';
import { executeConfigIsWithArgs } from './query.util';

const createQuery: CreateQuery = (config, queryState, queryOptions) => {
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

      const result = await request({
        route,
        init: { method: config.method },
      });

      return result;
    },
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    create: (config) => createQuery(config, QUERY_STATE, QUERY_OPTIONS),
  };
};

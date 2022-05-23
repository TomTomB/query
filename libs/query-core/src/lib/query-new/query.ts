import {
  isQueryStateExpired,
  isQueryStateLoadingItem,
  isQueryStateSuccessItem,
  QueryState,
} from '../query-state';
import { InitializeQueryConfig } from '../query/query.types';
import {
  buildRoute,
  isAbortRequestError,
  isRequestError,
  request,
} from '../request';
import {
  BaseArguments,
  MethodType,
  Query,
  QueryConfig,
  ExecuteOptions,
  RouteType,
} from './query.types';

export const createQuery = <
  Method extends MethodType,
  Name extends string,
  FullName extends `${Lowercase<Method>}${Name}`,
  Route extends RouteType<Arguments>,
  Response = unknown,
  Arguments extends BaseArguments | void = void
>(
  config: QueryConfig<Method, Name, Route, Response, Arguments>,
  queryState: QueryState,
  queryClientConfig: InitializeQueryConfig
) => {
  const fullName = `${config.method.toLowerCase()}${config.name}` as FullName;

  const doStuff = () => true;

  const query = {
    [fullName]: (args?: Arguments, options?: ExecuteOptions) => {
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
  } as Query<FullName, Arguments, Response>;

  return query;
};

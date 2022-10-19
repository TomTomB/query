import { RequestHeaders } from '@tomtomb/query-core';
import { filter, Observable, takeWhile } from 'rxjs';
import { ResponseTransformerType } from '../query-client';
import {
  BaseArguments,
  Cancelled,
  Failure,
  GqlQueryConfig,
  Loading,
  Prepared,
  QueryState,
  QueryStateData,
  QueryStateType,
  RouteType,
  Success,
} from './query.types';

export function filterSuccess() {
  return function <T extends QueryState, Response extends QueryStateData<T>>(
    source: Observable<T>
  ) {
    return source.pipe(
      filter((value) => isQueryStateSuccess(value))
    ) as Observable<Success<Response>>;
  };
}

export function filterFailure() {
  return function <T extends QueryState>(source: Observable<T>) {
    return source.pipe(
      filter((value) => isQueryStateFailure(value))
    ) as Observable<Failure>;
  };
}

export function takeUntilResponse() {
  return function <T extends QueryState>(source: Observable<T>) {
    return source.pipe(takeWhile((value) => isQueryStateLoading(value), true));
  };
}

export const isQueryStateLoading = (state: QueryState): state is Loading =>
  state.type === QueryStateType.Loading;

export const isQueryStateSuccess = (state: QueryState): state is Success =>
  state.type === QueryStateType.Success;

export const isQueryStateFailure = (state: QueryState): state is Failure =>
  state.type === QueryStateType.Failure;

export const isQueryStateCancelled = (state: QueryState): state is Cancelled =>
  state.type === QueryStateType.Cancelled;

export const isQueryStatePrepared = (state: QueryState): state is Prepared =>
  state.type === QueryStateType.Prepared;

export const mergeHeaders = (
  ...headers: Array<RequestHeaders | null | undefined>
) => {
  return headers.reduce((acc, headers) => {
    if (!headers) {
      return acc;
    }

    return {
      ...acc,
      ...headers,
    };
  }, {});
};

export const isGqlQueryConfig = <
  Response,
  Arguments extends BaseArguments | undefined,
  Route extends RouteType<Arguments> | undefined,
  ResponseTransformer extends ResponseTransformerType<Response> | undefined
>(
  config: unknown
): config is GqlQueryConfig<
  Route,
  Response,
  Arguments,
  ResponseTransformer
> => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return false;
  }

  if (!('query' in config)) {
    return false;
  }

  return true;
};

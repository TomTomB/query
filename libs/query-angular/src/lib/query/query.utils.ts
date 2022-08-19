import { filter, Observable, takeWhile } from 'rxjs';
import {
  Cancelled,
  Failure,
  Loading,
  Prepared,
  QueryState,
  QueryStateData,
  QueryStateType,
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

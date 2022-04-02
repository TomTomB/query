import { QueryPromise } from '../query/query.util';

export interface QueryStateLoadingItem {
  state: 'loading';
  abortController: AbortController;
  promise: QueryPromise<unknown, unknown>;
}

export interface QueryStateSuccessItem {
  state: 'success';
  expiresIn: number | null;
  data: unknown;
}

export interface QueryStateErrorItem {
  state: 'error';
  error: unknown;
}

export type QueryStateItem =
  | QueryStateLoadingItem
  | QueryStateSuccessItem
  | QueryStateErrorItem;

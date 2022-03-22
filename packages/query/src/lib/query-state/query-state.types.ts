export interface QueryStateLoadingItem {
  state: 'loading';
  abortController: AbortController;
  promise: Promise<unknown>;
}

export interface QueryStateSuccessItem {
  state: 'success';
  expiresIn: number;
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

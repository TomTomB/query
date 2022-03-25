import {
  QueryStateErrorItem,
  QueryStateItem,
  QueryStateLoadingItem,
  QueryStateSuccessItem,
} from './query-state.types';

export const isQueryStateLoadingItem = (
  item: QueryStateItem | null
): item is QueryStateLoadingItem => item?.state === 'loading';

export const isQueryStateSuccessItem = (
  item: QueryStateItem | null
): item is QueryStateSuccessItem => item?.state === 'success';

export const isQueryStateErrorItem = (
  item: QueryStateItem | null
): item is QueryStateErrorItem => item?.state === 'error';

export const isQueryStateExpired = (item: QueryStateSuccessItem) => {
  return item.expiresIn < Date.now();
};

import {
  queryStateCannotTransform,
  queryStateAlreadyHasKey,
  queryStateDoesNotContainKey,
} from '../logger';
import { QueryStateItem, QueryStateLoadingItem } from './query-state.types';

export class QueryState {
  private readonly state = new Map<string, QueryStateItem>();

  get(key: string) {
    return this.state.get(key) ?? null;
  }

  set(key: string, value: QueryStateItem) {
    this.state.set(key, value);
  }

  delete(key: string) {
    this.state.delete(key);
  }

  has(key: string) {
    return this.state.has(key);
  }

  clear() {
    this.state.clear();
  }

  insertLoadingState(key: string, item: Omit<QueryStateLoadingItem, 'state'>) {
    if (this.has(key)) {
      throw queryStateAlreadyHasKey(key);
    }

    this.set(key, { ...item, state: 'loading' });
  }

  transformToSuccessState(key: string, data: unknown, expiresIn: number) {
    const item = this.get(key);

    if (!item) {
      throw queryStateDoesNotContainKey(key);
    }

    if (item.state !== 'loading') {
      throw queryStateCannotTransform(item);
    }

    this.set(key, {
      state: 'success',
      expiresIn,
      data,
    });
  }

  transformToErrorState(key: string, error: unknown) {
    const item = this.get(key);

    if (!item) {
      throw queryStateDoesNotContainKey(key);
    }

    if (item.state !== 'loading') {
      throw queryStateCannotTransform(item);
    }

    this.set(key, {
      state: 'error',
      error,
    });
  }
}

import { queryStateAlreadyHasKey } from '../logger';
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

  insertLoadingState(key: string, item: QueryStateLoadingItem) {
    if (this.has(key)) {
      throw queryStateAlreadyHasKey(key);
    }

    this.set(key, item);
  }
}

import {
  queryStateCannotTransformError,
  queryStateAlreadyHasKeyError,
  queryStateDoesNotContainKeyError,
} from '../logger';
import { QueryStateItem, QueryStateLoadingItem } from './query-state.types';

export class QueryState {
  readonly #_state = new Map<string, QueryStateItem>();
  #_garbageCollector: number | null = null;
  #_config;

  constructor(_config?: {
    enableChangeLogging?: boolean;
    enableGarbageCollectorLogging?: boolean;
  }) {
    this.#_config = _config ?? {};
  }

  get(key: string) {
    return this.#_state.get(key) ?? null;
  }

  set(key: string, value: QueryStateItem) {
    this.#_state.set(key, value);
    this.#_initGarbageCollector();

    this.#_logState(key, value, 'SET');
  }

  delete(key: string) {
    this.#_state.delete(key);

    this.#_logState(key, null, 'DELETE');
  }

  has(key: string) {
    return this.#_state.has(key);
  }

  clear() {
    this.#_state.clear();
    this.#_initGarbageCollector();

    this.#_logState(null, null, 'CLEAR');
  }

  insertLoadingState(key: string, item: Omit<QueryStateLoadingItem, 'state'>) {
    if (this.has(key)) {
      throw queryStateAlreadyHasKeyError(key);
    }

    this.set(key, { ...item, state: 'loading' });
  }

  transformToSuccessState(
    key: string,
    data: unknown,
    expiresIn: number | null
  ) {
    const item = this.get(key);

    if (!item) {
      throw queryStateDoesNotContainKeyError(key);
    }

    if (item.state !== 'loading') {
      throw queryStateCannotTransformError(item);
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
      throw queryStateDoesNotContainKeyError(key);
    }

    if (item.state !== 'loading') {
      throw queryStateCannotTransformError(item);
    }

    this.set(key, {
      state: 'error',
      error,
    });
  }

  #_logState(
    key: string | null,
    item: QueryStateItem | null,
    operation: string
  ) {
    if (!this.#_config?.enableChangeLogging) return;

    const stateAsJson: Record<string, QueryStateItem> = {};

    this.#_state.forEach((value, key) => {
      stateAsJson[key] = value;
    });

    console.log(`%c[${operation}] ${key}`, 'font-weight: bold');

    console.table({ operation, key, item });
    console.table(stateAsJson);
  }

  #_initGarbageCollector() {
    if (this.#_garbageCollector !== null) {
      return;
    }

    this.#_logGarbageCollector('Start');

    this.#_garbageCollector = window.setInterval(() => {
      this.#_runGarbageCollector();
    }, 15000);
  }

  #_stopGarbageCollector() {
    if (this.#_garbageCollector !== null) {
      window.clearInterval(this.#_garbageCollector);
      this.#_garbageCollector = null;
    }
  }

  #_runGarbageCollector() {
    const now = Date.now();

    this.#_logGarbageCollector('Collecting...');

    this.#_state.forEach((item, key) => {
      if (
        (item.state === 'success' &&
          (item.expiresIn === null || now > item.expiresIn)) ||
        item.state === 'error'
      ) {
        this.delete(key);
      }
    });

    this.#_logGarbageCollector('Collection done');

    if (!this.#_state.size) {
      this.#_stopGarbageCollector();
      this.#_logGarbageCollector('Stop');
    }
  }

  #_logGarbageCollector(action: string) {
    if (!this.#_config?.enableGarbageCollectorLogging) return;

    console.log(`%cGC: ${action}`, 'color: yellow; font-weight: bold');
  }
}

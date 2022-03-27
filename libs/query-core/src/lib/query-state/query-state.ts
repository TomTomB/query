import {
  queryStateCannotTransform,
  queryStateAlreadyHasKey,
  queryStateDoesNotContainKey,
} from '../logger';
import { QueryStateItem, QueryStateLoadingItem } from './query-state.types';

export class QueryState {
  private readonly state = new Map<string, QueryStateItem>();
  private _garbageCollector: number | null = null;

  constructor(private _config?: { enableLogging?: boolean }) {}

  get(key: string) {
    return this.state.get(key) ?? null;
  }

  set(key: string, value: QueryStateItem) {
    this.state.set(key, value);
    this._initGarbageCollector();

    this._logState(key, value, 'SET');
  }

  delete(key: string) {
    this.state.delete(key);

    this._logState(key, null, 'DELETE');
  }

  has(key: string) {
    return this.state.has(key);
  }

  clear() {
    this.state.clear();
    this._initGarbageCollector();

    this._logState(null, null, 'CLEAR');
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

  private _logState(
    key: string | null,
    item: QueryStateItem | null,
    operation: string
  ) {
    if (!this._config?.enableLogging) return;

    const stateAsJson: Record<string, QueryStateItem> = {};

    this.state.forEach((value, key) => {
      stateAsJson[key] = value;
    });

    console.log({ operation, key, item });
    console.log(stateAsJson);
  }

  private _initGarbageCollector() {
    if (this._garbageCollector !== null) {
      return;
    }

    this._garbageCollector = window.setInterval(() => {
      this._runGarbageCollector();
    }, 15000);
  }

  private _stopGarbageCollector() {
    if (this._garbageCollector !== null) {
      window.clearInterval(this._garbageCollector);
      this._garbageCollector = null;
    }
  }

  private _runGarbageCollector() {
    const now = Date.now();

    if (this._config?.enableLogging) {
      console.log('Garbage collector: Start run');
    }

    this.state.forEach((item, key) => {
      if (
        (item.state === 'success' && now > item.expiresIn) ||
        item.state === 'error'
      ) {
        this.delete(key);
      }
    });

    if (!this.state.size) {
      this._stopGarbageCollector();
      if (this._config?.enableLogging) {
        console.log('Garbage collector: Stop');
      }
    }

    if (this._config?.enableLogging) {
      console.log('Garbage collector: End run');
    }
  }
}

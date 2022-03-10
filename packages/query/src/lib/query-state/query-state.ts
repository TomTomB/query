export class QueryState {
  private readonly state = new Map<string, unknown>();

  get<T>(key: string) {
    return this.state.get(key) as T | undefined;
  }

  set<T>(key: string, value: T) {
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
}

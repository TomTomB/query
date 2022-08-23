import { QueryClient } from '../query-client';
import { AuthProvider, AuthProviderBasicConfig } from './auth-provider.types';

export class BasicAuthProvider implements AuthProvider {
  get header() {
    return { Authorization: `Basic ${this._basicAuthString}` };
  }

  private get _basicAuthString() {
    return btoa(`${this._config.username}:${this._config.password}`);
  }

  queryClient: QueryClient | null = null;

  constructor(private _config: AuthProviderBasicConfig) {}

  cleanUp(): void {
    // noop
  }
}

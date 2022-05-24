import { QueryClient } from '@tomtomb/query-core';
import { environment } from '../../environments/environment';

export const query = new QueryClient({
  baseRoute: environment.apiUrl,
  logging: {
    queryStateChanges: !environment.production && !environment.test,
    queryStateGarbageCollector: !environment.production && !environment.test,
  },
});

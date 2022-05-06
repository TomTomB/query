import { initializeQuery } from '@tomtomb/query-core';
import { environment } from '../../environments/environment';

export const query = initializeQuery({
  baseRoute: environment.apiUrl,
  logging: {
    queryStateChanges: !environment.production && !environment.test,
  },
});

export const ggQuery = initializeQuery({
  baseRoute: environment.ggApiUrl,
  logging: {
    queryStateChanges: !environment.production && !environment.test,
  },
});

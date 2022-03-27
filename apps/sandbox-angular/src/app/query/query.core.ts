import { initializeQuery } from '@tomtomb/query-core';
import { environment } from '../../environments/environment';

export const query = initializeQuery({
  baseRoute: environment.apiUrl,
  logging: { queryState: !environment.production },
});

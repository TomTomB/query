import { initializeQuery } from '@tomtomb/query';
import { environment } from '../../environments/environment';

export const query = initializeQuery({
  baseRoute: environment.apiUrl,
  logging: { queryState: !environment.production },
});

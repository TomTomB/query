import { Method } from '@tomtomb/query-core';

export const shouldCacheQuery = (method: Method) => {
  return (
    method === 'GET' ||
    method === 'OPTIONS' ||
    method === 'HEAD' ||
    method === 'GQL_QUERY'
  );
};

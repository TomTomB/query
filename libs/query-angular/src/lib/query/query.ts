import {
  InitializeQueryConfig,
  initializeQuery as initializeQueryCore,
  Query,
} from '@tomtomb/query-core';

export const initializeQuery = (config: InitializeQueryConfig): Query => {
  const coreQuery = initializeQueryCore(config);

  return {
    create: (config) => {
      const query = coreQuery.create(config);

      return query;
    },
  };
};

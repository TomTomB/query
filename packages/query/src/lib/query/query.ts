/* eslint-disable */
import { QueryState } from '../query-state';
import { CreateQuery, InitializeQueryConfig, Query } from './query.types';
import { executeConfigIsWithArgs } from './query.util';

const createQuery: CreateQuery = (config, queryState, queryOptions) => {
  return {
    execute: (config) => {
      if (executeConfigIsWithArgs(config)) {
      }

      return;
    },
  };
};

export const initializeQuery = (config: InitializeQueryConfig): Query => {
  const QUERY_STATE = new QueryState();

  const QUERY_OPTIONS = {
    baseRoute: config.baseRoute,
  };

  return {
    // @ts-ignore
    create: (config) => createQuery(config, QUERY_STATE, QUERY_OPTIONS),
  };
};

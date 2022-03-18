/* eslint-disable */
import { QueryState } from '../query-state';
import { request } from '../request';
import { CreateQuery, InitializeQueryConfig, Query } from './query.types';
import { executeConfigIsWithArgs } from './query.util';

const createQuery: CreateQuery = (config, queryState, queryOptions) => {
  return {
    execute: (execCfg) => {
      if (
        executeConfigIsWithArgs(execCfg) &&
        typeof config.route === 'function'
      ) {
        return request({
          url: (config as any).route(execCfg.args.pathParams),
          params: execCfg.args.queryParams,
        });
      }

      return request({ url: config.route });
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

/* eslint-disable */
import { QueryState } from '../query-state';
import {
  ExecuteConfig,
  ExecuteConfigWithoutArgs,
  InitializeQueryConfig,
  QueryBaseArguments,
  RunQueryConfig,
} from './query.types';
import { executeConfigIsWithArgs } from './query.util';

const createQuery = <
  Response = unknown,
  Arguments extends QueryBaseArguments | unknown = unknown,
  ErrorResponse = unknown
>(
  config: RunQueryConfig<Arguments>,
  queryState: QueryState,
  queryOptions: InitializeQueryConfig
): {
  execute: Arguments extends QueryBaseArguments
    ? (config: ExecuteConfig<Arguments>) => void
    : (config?: ExecuteConfigWithoutArgs) => void;
} => {
  return {
    // @ts-ignore
    execute: (config) => {
      if (executeConfigIsWithArgs(config)) {
      }

      return;
    },
  };
};

export const initializeQuery = (config: InitializeQueryConfig) => {
  const QUERY_STATE = new QueryState();

  const QUERY_OPTIONS = {
    baseRoute: config.baseRoute,
  };

  return {
    create: <
      Response = unknown,
      Arguments extends QueryBaseArguments | unknown = unknown,
      ErrorResponse = unknown
    >(
      config: RunQueryConfig<Arguments>
    ) =>
      createQuery<Response, Arguments, ErrorResponse>(
        config,
        QUERY_STATE,
        QUERY_OPTIONS
      ),
  };
};

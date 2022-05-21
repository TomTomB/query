import {
  ExecuteConfig,
  ExecuteConfigWithoutArgs,
  QueryBaseArguments,
} from './query.types';

export const executeConfigIsWithArgs = (
  config?: ExecuteConfig<QueryBaseArguments> | ExecuteConfigWithoutArgs
): config is ExecuteConfig<QueryBaseArguments> => !!config && 'args' in config;

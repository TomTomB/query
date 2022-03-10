import {
  ExecuteConfig,
  ExecuteConfigWithoutArgs,
  QueryBaseArguments,
} from './query.types';

export const executeConfigIsWithArgs = (
  config?: ExecuteConfig<QueryBaseArguments> | ExecuteConfigWithoutArgs
): config is ExecuteConfig<QueryBaseArguments> => {
  return !!config && 'args' in config;
};

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

export class QueryPromise<Resolve, Reject> extends Promise<Resolve> {
  constructor(
    executor: (
      resolve: (value: Resolve | PromiseLike<Resolve>) => void,
      reject: (reason: Reject) => void
    ) => void
  ) {
    super(executor);
  }

  override catch<TResult = never>(
    onrejected?: ((reason: Reject) => TResult | PromiseLike<TResult>) | null
  ): Promise<Resolve | TResult> {
    return super.catch(onrejected);
  }
}

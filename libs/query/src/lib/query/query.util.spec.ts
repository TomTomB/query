import {
  ExecuteConfig,
  ExecuteConfigWithoutArgs,
  QueryBaseArguments,
} from './query.types';
import { executeConfigIsWithArgs } from './query.util';

describe('query util', () => {
  it('should work', () => {
    const config: ExecuteConfigWithoutArgs = {};

    expect(executeConfigIsWithArgs(config)).toBeFalsy();
  });

  it('should work', () => {
    expect(executeConfigIsWithArgs()).toBeFalsy();
  });

  it('should work', () => {
    const config: ExecuteConfig<QueryBaseArguments> = {
      args: { queryParams: { foo: 1 } },
    };

    expect(executeConfigIsWithArgs(config)).toBeTruthy();
  });
});

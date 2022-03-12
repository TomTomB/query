import { initializeQuery } from './query';
import { Query } from './query.types';

const API_BASE = 'https://jsonplaceholder.typicode.com';

describe('query', () => {
  let query: Query;

  beforeEach(() => {
    query = initializeQuery({
      baseRoute: API_BASE,
    });
  });

  it('should work', () => {
    expect(initializeQuery({ baseRoute: API_BASE })).toBeTruthy();
  });

  it('should work', () => {
    interface GetPostArgs {
      pathParams: { id: number };
    }

    const getPost = query.create<unknown, GetPostArgs>({
      method: 'GET',
      route: (d) => `/posts/${d.id}`,
    });

    expect(getPost.execute({ args: { pathParams: { id: 1 } } })).toBeFalsy();
  });

  it('should work', () => {
    const getPost = query.create({
      method: 'GET',
      route: 'posts',
    });

    expect(getPost.execute()).toBeFalsy();
  });
});

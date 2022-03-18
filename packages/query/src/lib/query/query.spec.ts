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

  it('should work', async () => {
    interface GetPostArgs {
      pathParams: { id: number };
    }

    fetchMock.mockResponseOnce(JSON.stringify({ foo: 'bar' }));

    const getPost = query.create<{ foo: string }, GetPostArgs>({
      method: 'GET',
      route: (d) => `/posts/${d.id}`,
    });

    expect(await getPost.execute({ args: { pathParams: { id: 1 } } })).toEqual({
      foo: 'bar',
    });
  });

  it('should work', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ foo: 'bar' }));

    const getPost = query.create<{ foo: string }>({
      method: 'GET',
      route: 'posts',
    });

    expect(await getPost.execute()).toEqual({ foo: 'bar' });
  });
});

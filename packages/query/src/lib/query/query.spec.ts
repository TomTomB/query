import { initializeQuery } from './query';

const API_BASE = 'https://jsonplaceholder.typicode.com';

describe('query', () => {
  it('should work', () => {
    expect(initializeQuery({ baseRoute: API_BASE })).toBeTruthy();
  });

  it('should work', () => {
    const query = initializeQuery({ baseRoute: API_BASE });

    interface GetPostArgs {
      queryParams: { id: number };
    }

    const getPost = query.create<unknown, GetPostArgs>({
      method: 'GET',
      route: (d) => `/posts/${d.id}`,
    });

    expect(getPost.execute({ args: { queryParams: { id: 1 } } })).toBeFalsy();
  });

  it('should work', () => {
    const query = initializeQuery({ baseRoute: API_BASE });

    const getPost = query.create({
      method: 'GET',
      route: 'posts',
    });

    expect(getPost.execute()).toBeFalsy();
  });
});

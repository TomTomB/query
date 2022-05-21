import { invalidBaseRouteError } from '../logger';
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

  it('should be able to initialize a new query instance', () => {
    expect(initializeQuery({ baseRoute: API_BASE })).toBeTruthy();
  });

  it('should throw when trying to initialize a new query with a invalid base route', () => {
    expect(() => {
      initializeQuery({ baseRoute: API_BASE + '/' });
    }).toThrow(invalidBaseRouteError(API_BASE + '/'));
  });

  it('should be able to create and exec a call with params', async () => {
    interface GetPostArgs {
      pathParams: { id: number };
      queryParams: { includeComments: boolean; otherFields: string[] };
    }

    fetchMock.mockResponseOnce(JSON.stringify({ foo: 'bar' }));

    const getPost = query.create<{ foo: string }, GetPostArgs>({
      method: 'GET',
      route: (d) => `/posts/${d.id}`,
    });

    expect(
      await getPost.execute({
        args: {
          pathParams: { id: 1 },
          queryParams: {
            includeComments: true,
            otherFields: ['author', 'createdAt'],
          },
        },
      })
    ).toEqual({
      foo: 'bar',
    });
  });

  it('should be able to create and exec a call without params', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ foo: 'bar' }));

    const getPost = query.create<{ foo: string }>({
      method: 'GET',
      route: '/posts',
    });

    expect(await getPost.execute()).toEqual({ foo: 'bar' });
  });

  it('should be able to create and exec a call without params', async () => {
    const resp = {
      ok: false,
      status: 404,
      statusText: 'Not found',
      json: () => Promise.resolve({ error: 'This is a detail error' }),
    };

    fetchMock.mockRejectOnce(() => Promise.reject(resp));

    const getPost = query.create<{ foo: string }, { error: string }>({
      method: 'GET',
      route: '/posts',
    });

    getPost.execute().catch((error) =>
      expect(error).toEqual({
        code: resp.status,
        detail: {
          error: 'This is a detail error',
        },
        message: resp.statusText,
        raw: resp,
      })
    );
  });
});

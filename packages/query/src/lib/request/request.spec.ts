import fetchMock from 'jest-fetch-mock';
import { request } from './request';
import { buildRoute } from './request.util';

interface TestResponse {
  foo: string;
  bar: string;
}

const TEST_URL = 'https://jsonplaceholder.typicode.com';

describe('request', () => {
  it('should return a specified object', async () => {
    const responseData = { foo: 'bar', bar: 'baz' };

    fetchMock.mockResponseOnce(JSON.stringify(responseData));

    const response = await request<TestResponse>({
      route: TEST_URL + '/posts/1',
      init: { method: 'GET' },
    });

    expect(response).toEqual(responseData);
  });

  it('should return a specified object with usage of params', async () => {
    const responseData = { foo: 'bar', bar: 'baz' };

    fetchMock.mockResponseOnce(JSON.stringify(responseData));

    const route = buildRoute({
      base: TEST_URL,
      route: '/posts/1',
      queryParams: {
        foo: 'bar',
        isTrue: true,
        number: 1,
        array: [1, undefined, 'string', false, null],
      },
    });

    const response = await request<TestResponse>({
      route,
      init: { method: 'GET' },
    });

    expect(response).toEqual(responseData);
  });

  it('should throw an error with code 0', async () => {
    fetchMock.mockRejectOnce(new Error('This is an error'));

    try {
      await request({
        route: TEST_URL + '/foo/bar',
        init: { method: 'GET' },
      });
    } catch (error) {
      expect(error).toEqual({
        code: 0,
        detail: null,
        message: 'Unknown error',
        raw: new Error('This is an error'),
      });
    }
  });

  it('should throw an error with code 404', async () => {
    const resp = {
      ok: false,
      status: 404,
      statusText: 'Not found',
      json: () => Promise.resolve(null),
    };

    fetchMock.mockRejectOnce(() => Promise.reject(resp));

    try {
      await request({
        route: TEST_URL + '/foo/bar',
        init: { method: 'GET' },
      });
    } catch (error) {
      expect(error).toEqual({
        code: resp.status,
        detail: null,
        message: resp.statusText,
        raw: resp,
      });
    }
  });
});

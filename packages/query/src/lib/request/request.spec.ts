import fetchMock from 'jest-fetch-mock';
import { request } from './request';

interface TestResponse {
  foo: string;
  bar: string;
}

const TEST_URL = 'https://jsonplaceholder.typicode.com/';

describe('request', () => {
  it('should work', async () => {
    const responseData = { foo: 'bar', bar: 'baz' };

    fetchMock.mockResponseOnce(JSON.stringify(responseData));

    const response = await request<TestResponse>({
      url: TEST_URL + 'posts/1',
      init: { method: 'GET' },
    });

    expect(response).toEqual(responseData);
  });

  it('should work', async () => {
    const responseData = { foo: 'bar', bar: 'baz' };

    fetchMock.mockResponseOnce(JSON.stringify(responseData));

    const response = await request<TestResponse>({
      url: TEST_URL + 'posts/1',
      init: { method: 'GET' },
      params: {
        foo: 'bar',
        isTrue: true,
        number: 1,
        array: [1, undefined, 'string', false, null],
      },
    });

    expect(response).toEqual(responseData);
  });

  it('should work', async () => {
    fetchMock.mockRejectOnce(new Error('This is an error'));

    const response = await request({
      url: TEST_URL + 'foo/bar',
      init: { method: 'GET' },
    });

    expect(response).toEqual({
      code: 0,
      detail: null,
      message: 'Unknown error',
    });
  });

  it('should work', async () => {
    const resp = {
      ok: false,
      status: 404,
      statusText: 'Not found',
      json: () => Promise.resolve(null),
    };

    fetchMock.mockRejectOnce(() => Promise.reject(resp));

    const response = await request({
      url: TEST_URL + 'foo/bar',
      init: { method: 'GET' },
    });

    expect(response).toEqual({
      code: resp.status,
      detail: null,
      message: resp.statusText,
    });
  });
});

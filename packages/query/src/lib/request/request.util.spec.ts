import {
  buildQueryArrayString,
  buildQueryString,
  isFetchResponse,
  isRequestError,
} from './request.util';

describe('request util', () => {
  it('should work', () => {
    expect(isRequestError('foo')).toBeFalsy();
  });

  it('should work', () => {
    expect(isRequestError({ code: 200, message: 'Error' })).toBeTruthy();
  });

  it('should work', () => {
    expect(buildQueryString({ foo: 123 })).toEqual('foo=123');
    expect(buildQueryString({ foo: 123, bar: 'string' })).toEqual(
      'foo=123&bar=string'
    );
    expect(buildQueryString({ foo: undefined })).toEqual('');
    expect(buildQueryString({ foo: undefined, bar: true })).toEqual('bar=true');

    const uriBrackets = encodeURIComponent('[]');

    expect(
      buildQueryString({
        foo: ['abc', 'def', null, undefined],
        bar: true,
        something: null,
        other: undefined,
      })
    ).toEqual(`foo${uriBrackets}=abc&foo${uriBrackets}=def&bar=true`);
  });

  it('should work', () => {
    const uriBrackets = encodeURIComponent('[]');

    expect(buildQueryArrayString('key', ['abc', 'def'])).toEqual(
      `key${uriBrackets}=abc&key${uriBrackets}=def`
    );
  });

  it('should work', () => {
    expect(isFetchResponse({ foo: 'bar' })).toBeFalsy();
    expect(
      isFetchResponse({
        ok: false,
        status: 404,
        statusText: 'Not found',
        json: () => Promise.resolve(null),
      })
    ).toBeTruthy();
  });
});

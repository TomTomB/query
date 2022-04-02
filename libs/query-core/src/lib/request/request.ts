import { RequestError, CacheAdapterFn } from './request.types';
import { extractExpiresIn, isFetchResponse } from './request.util';

export const request = async <
  SuccessResponse = unknown,
  ErrorResponse = unknown
>(options: {
  route: string;
  init?: RequestInit;
  cacheAdapter?: CacheAdapterFn;
}) => {
  try {
    const response = await fetch(options.route, options.init);

    if (!response.ok) {
      throw response;
    }

    const data = (await response.json()) as SuccessResponse;

    const expiresInSeconds = options.cacheAdapter
      ? options.cacheAdapter(response.headers)
      : extractExpiresIn(response.headers);

    let expiresInTimestamp = expiresInSeconds
      ? new Date(Date.now() + expiresInSeconds * 1000).getTime()
      : null;

    return { data, expiresInTimestamp };
  } catch (error) {
    if (error instanceof DOMException && error.code === error.ABORT_ERR) {
      throw {
        code: -1,
        message: 'Request aborted',
        detail: null,
        raw: error,
      } as RequestError;
    }

    if (isFetchResponse(error)) {
      throw {
        code: error.status,
        message: error.statusText,
        detail: await error.json(),
        raw: error,
      } as RequestError<ErrorResponse>;
    }

    throw {
      code: 0,
      message: 'Unknown error',
      detail: null,
      raw: error,
    } as RequestError;
  }
};

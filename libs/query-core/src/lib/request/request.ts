import { CacheAdapterFn } from './request.types';
import {
  buildRequestError,
  buildTimestampFromSeconds,
  extractExpiresInSeconds,
} from './request.util';

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
      : extractExpiresInSeconds(response.headers);

    const expiresInTimestamp = buildTimestampFromSeconds(expiresInSeconds);

    return { data, expiresInTimestamp };
  } catch (error) {
    throw await buildRequestError<ErrorResponse>(error);
  }
};

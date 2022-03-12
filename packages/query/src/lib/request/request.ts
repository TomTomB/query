import { UnfilteredParams, RequestError } from './request.types';
import { buildQueryString, isFetchResponse } from './request.util';

export const request = async <
  SuccessResponse = unknown,
  ErrorResponse = unknown
>(options: {
  url: string;
  init?: RequestInit;
  params?: UnfilteredParams;
}) => {
  try {
    let url = options.url;

    if (options.params) {
      const params = buildQueryString(options.params);

      if (params) {
        url = `${url}?${params}`;
      }
    }

    const response = await fetch(url, options.init);

    if (!response.ok) {
      throw response;
    }

    const data = (await response.json()) as SuccessResponse;

    return data;
  } catch (error) {
    if (isFetchResponse(error)) {
      throw {
        code: error.status,
        message: error.statusText,
        detail: await error.json(),
      } as RequestError<ErrorResponse>;
    }

    throw { code: 0, message: 'Unknown error', detail: null } as RequestError;
  }
};

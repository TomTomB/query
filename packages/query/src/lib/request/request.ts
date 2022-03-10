import { Params, RequestError } from './request.types';
import { buildQueryString, isFetchResponse } from './request.util';

export const request = async <
  SuccessResponse = unknown,
  ErrorResponse = unknown
>(options: {
  url: string;
  init?: RequestInit;
  params?: Params;
}) => {
  try {
    let url = options.url;

    if (options.params) {
      const params = buildQueryString(options.params);
      url = `${url}?${params}`;
    }

    const response = await fetch(url, options.init);

    if (!response.ok) {
      throw response;
    }

    const data = (await response.json()) as SuccessResponse;

    return data;
  } catch (error) {
    if (isFetchResponse(error)) {
      return {
        code: error.status,
        message: error.statusText,
        detail: await error.json(),
      } as RequestError<ErrorResponse>;
    }

    return { code: 0, message: 'Unknown error', detail: null } as RequestError;
  }
};

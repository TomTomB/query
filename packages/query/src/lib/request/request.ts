import { RequestError } from './request.types';
import { isFetchResponse } from './request.util';

export const request = async <
  SuccessResponse = unknown,
  ErrorResponse = unknown
>(options: {
  route: string;
  init?: RequestInit;
}) => {
  try {
    const response = await fetch(options.route, options.init);

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

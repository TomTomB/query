import {
  UnfilteredParams,
  Params,
  RequestError,
  ParamArray,
} from './request.types';

export const isRequestError = (error: unknown): error is RequestError => {
  return error instanceof Object && 'code' in error && 'message' in error;
};

export const buildQueryString = (params: UnfilteredParams) => {
  const filteredParams: Params = Object.entries(params)
    .map(([key, value]) => {
      if (!Array.isArray(value)) {
        return [key, value];
      }

      return [key, value.filter((v) => v !== undefined && v !== null)];
    })
    .filter(([, value]) => value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key as string]: value }), {});

  return Object.keys(filteredParams)
    .map((key) =>
      Array.isArray(filteredParams[key])
        ? buildQueryArrayString(key, filteredParams[key] as ParamArray)
        : `${key}=${encodeURIComponent(
            filteredParams[key] as string | number | boolean
          )}`
    )
    .join('&');
};

export const buildQueryArrayString = (key: string, array: ParamArray) => {
  const uriBrackets = encodeURIComponent('[]');

  return array
    .slice()
    .map(
      (item) =>
        `${key}${uriBrackets}=${encodeURIComponent(
          item as string | number | boolean
        )}`
    )
    .join('&');
};

export const isFetchResponse = (response: unknown): response is Response =>
  typeof response === 'object' &&
  response !== null &&
  'status' in response &&
  'statusText' in response &&
  'json' in response &&
  typeof (response as Response)['json'] === 'function';

import {
  invalidBaseRouteError,
  invalidRouteError,
  pathParamsMissingInRouteFunctionError,
} from '../logger';
import {
  UnfilteredParams,
  Params,
  RequestError,
  ParamArray,
  UnfilteredParamPrimitive,
} from './request.types';

export const isRequestError = (error: unknown): error is RequestError => {
  return error instanceof Object && 'code' in error && 'message' in error;
};

export const isAbortRequestError = (error: unknown): error is RequestError => {
  return isRequestError(error) && error.code === -1;
};

export const buildRoute = (options: {
  base: string;
  route: ((args: Record<string, unknown>) => string) | string;
  pathParams?: Record<string, unknown>;
  queryParams?: UnfilteredParams;
}) => {
  if (options.base.endsWith('/')) {
    throw invalidBaseRouteError(options.base);
  }

  let route: string | null = null;

  if (typeof options.route === 'function') {
    if (!options.pathParams) {
      throw pathParamsMissingInRouteFunctionError(options.route({}));
    }

    route = options.route(options.pathParams);
  } else {
    route = options.route;
  }

  if (!route.startsWith('/')) {
    throw invalidRouteError(route);
  }

  if (options.queryParams) {
    const queryString = buildQueryString(options.queryParams);

    if (queryString) {
      route = `${route}?${queryString}`;
    }
  }

  return `${options.base}${route}`;
};

export const buildQueryString = (params: UnfilteredParams) => {
  const validParams = filterInvalidParams(params);

  const queryString = Object.keys(validParams)
    .map((key) =>
      Array.isArray(validParams[key])
        ? buildQueryArrayString(key, validParams[key] as ParamArray)
        : `${key}=${encodeURIComponent(
            validParams[key] as string | number | boolean
          )}`
    )
    .join('&');

  return queryString || null;
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

export const filterInvalidParams = (params: UnfilteredParams) => {
  const filteredParams: Params = Object.entries(params)
    .map(([key, value]) => {
      if (!Array.isArray(value)) {
        return [key, value];
      }

      return [key, value.filter((v) => isParamValid(v))];
    })
    .filter(([, value]) => isParamValid(value as UnfilteredParamPrimitive))
    .reduce((acc, [key, value]) => ({ ...acc, [key as string]: value }), {});

  return filteredParams;
};

export const isParamValid = (primitive: UnfilteredParamPrimitive) => {
  if (primitive === undefined || primitive === null || primitive === '') {
    return false;
  }

  if (typeof primitive === 'string' && primitive.trim() === '') {
    return false;
  }

  if (typeof primitive === 'number' && isNaN(primitive)) {
    return false;
  }

  return true;
};

export const extractExpiresIn = (headers: Headers) => {
  const cacheControl = headers.get('cache-control');
  const age = headers.get('age');
  const expires = headers.get('expires');

  // In seconds
  let expiresIn: number | null = null;
  let maxAge: number | null = null;

  if (cacheControl?.includes('no-cache')) {
    return null;
  }

  if (cacheControl?.includes('max-age')) {
    maxAge = parseInt(cacheControl.split('max-age=')[1]);
  } else if (cacheControl?.includes('s-maxage')) {
    maxAge = parseInt(cacheControl.split('s-maxage=')[1]);
  }

  if (maxAge && age) {
    const ageSeconds = parseInt(age);

    expiresIn = maxAge - ageSeconds;
  } else if (expires) {
    // Used by some apis to tell the response will never expire
    // In this case we let the response expire after 1 hour
    if (expires === '-1') {
      expiresIn = 3600;
    } else {
      const expiresDate = new Date(expires);

      // check if the date is valid
      if (expiresDate.toString() !== 'Invalid Date') {
        expiresIn = Math.floor((expiresDate.getTime() - Date.now()) / 1000);
      }
    }
  }

  return expiresIn;
};

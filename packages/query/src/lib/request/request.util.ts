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

export const buildRoute = (options: {
  base: string;
  route: ((args: Record<string, unknown>) => string) | string;
  pathParams?: Record<string, unknown>;
  queryParams?: UnfilteredParams;
}) => {
  if (options.base.endsWith('/')) {
    throw new Error('Base route must not end with a slash');
  }

  let route: string | null = null;

  if (typeof options.route === 'function') {
    if (!options.pathParams) {
      throw new Error('Path params are required for route function');
    }

    route = options.route(options.pathParams);
  } else {
    route = options.route;
  }

  if (!route.startsWith('/')) {
    throw new Error('Route must start with a slash');
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

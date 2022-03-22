export const buildErrorMessage = (code: string, message: string) =>
  `[@tomtomb/query:${code}] ${message}`;

export class QueryError extends Error {
  data?: unknown;

  constructor(code: string, message: string, data?: unknown) {
    super(buildErrorMessage(code, message));
    this.name = 'QueryError';
    this.data = data;
  }
}

export const invalidBaseRouteError = (data: unknown) => {
  return new QueryError('001', 'The baseRoute must not end with a slash', data);
};

export const invalidRouteError = (data: unknown) => {
  return new QueryError('002', 'The route must start with a slash', data);
};

export const pathParamsMissingInRouteFunctionError = (data: unknown) => {
  return new QueryError(
    '003',
    'The route is a function but pathParams are missing',
    data
  );
};

export const queryStateAlreadyHasKey = (data: unknown) => {
  return new QueryError(
    '004',
    'The query state already contains the provided key',
    data
  );
};

export const throwError = (code: string, message: string) => {
  throw new Error(`[@tomtomb/query:${code}] ${message}`);
};

export const throwAlreadyInitializedError = () => {
  throwError(
    '001',
    'Attempted to initialize query state when it was already initialized.'
  );
};

export const throwNotInitializedError = () => {
  throwError(
    '001',
    'Attempted to run query when it was not initialized. Did you call initializeQuery()?'
  );
};

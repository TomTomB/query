/**
 * Create a new query client
 *
 * - baseUrl
 *
 * - logging
 *   - queryState
 *     - garbageCollector
 *     - mutations
 *
 * - request
 *   - responseCacheAdapter
 */
const queryClient = createQueryClient({});

queryClient.auth.provideAutoRefreshAdapter((tokens) => ({
  query: queryClient.create({
    method: 'POST',
    route: 'auth/refresh-token',
  }),
  body: () => ({ refreshToken: tokens.refreshToken }),
}));

// Somewhere after a successful login
queryClient.auth.useTokens(tokens);

/**
 * Create a new query
 *
 * - method
 *
 * - usePolling
 * - pollingInterval
 *
 * - retryOnError
 * - retryDelay
 *
 * - isSecure (true if auth is set in queryClient)
 */
const getTodo = queryClient.create({});

/**
 * Subscribe to the query
 *
 * - headers
 * - pathParams
 * - queryParams
 * - body
 */
const sub = getTodo({}).subscribe({
  next: (data) => {},
  error: (error) => {},
});

/**
 * Create a new paginated query
 *
 * - limit
 * - mergeResults
 *
 * - retryOnError
 * - retryDelay
 *
 * - isSecure (true if auth is set in queryClient)
 */
const [
  getTodoItems,
  getNextPage,
  getPreviousPage,
  getPage,
  updateConfig,
  reset,
] = queryClient.createPaginated({});

/**
 * Subscribe to the paginated query
 *
 * - headers
 * - pathParams
 * - queryParams
 */
const sub2 = getTodoItems({}).subscribe({
  next: (data) => {},
  error: (error) => {},
});

getNextPage();

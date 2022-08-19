import { CacheAdapterFn } from '@tomtomb/query-core';

export interface QueryClientConfig {
  /**
   * The api base route.
   * @example 'https://api.example.com'
   */
  baseRoute: `https://${string}` | `http://localhost:${string}`;

  /**
   * Logging configuration for debugging.
   */
  logging?: {
    /**
     * Log all query state changes.
     */
    queryStateChanges?: boolean;

    /**
     * Log query state garbage collector runs.
     */
    queryStateGarbageCollector?: boolean;
  };

  /**
   * Request options.
   */
  request?: {
    /**
     * Adapter function used for extracting the time until the response is invalid.
     * The default uses the `cache-control` (`max-age` & `s-maxage`), `age` and `expires` headers.
     * Should return a number in seconds.
     */
    cacheAdapter?: CacheAdapterFn;
  };
}

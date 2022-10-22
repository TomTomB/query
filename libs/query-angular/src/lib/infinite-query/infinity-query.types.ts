import { BaseArguments } from '../query';
import { AnyQueryCreator } from '../query-client';

export type PageParamLocation =
  | 'path'
  | 'query'
  | 'body'
  | 'header'
  | 'variable';

export interface InfinityQueryConfig<
  QueryCreator extends AnyQueryCreator,
  Arguments extends BaseArguments,
  QueryResponse,
  InfinityResponse extends unknown[]
> {
  /**
   * The query creator to use for fetching pages.
   */
  queryCreator: QueryCreator;

  /**
   * The location of paging params in request.
   *
   * @default "query"
   */
  pageParamLocation?: PageParamLocation;

  /**
   * Used as page param name.
   *
   * @default "page"
   */
  pageParamName?: string;

  /**
   * The args that will be merged with the page arg.
   */
  defaultArgs?: Arguments;

  /**
   * The type of the array that will be created by the infinite query.
   */
  responseArrayType: InfinityResponse;

  /**
   * A function that returns the data array from the response.
   * This function should return the type provided in `responseArrayType`.
   */
  responseArrayExtractor: (response: QueryResponse) => InfinityResponse;
}

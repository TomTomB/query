import { BaseArguments } from '../query';
import { AnyQueryCreator } from '../query-client';

export type PageParamLocation =
  | 'path'
  | 'query'
  | 'body'
  | 'header'
  | 'variable';

export type AppendItemsLocation = 'start' | 'end';

export interface PageParamCalculatorOptions {
  page: number;
  totalPages: number | null;
  itemsPerPage: number | null;
}

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
   * The type of the array that will be created by the infinite query.
   */
  responseArrayType: InfinityResponse;

  /**
   * A function that returns the data array from the response.
   * This function should return the type provided in `responseArrayType`.
   */
  responseArrayExtractor: (response: QueryResponse) => InfinityResponse;

  /**
   * Used as page param name.
   *
   * @default "page"
   */
  pageParamName?: string;

  /**
   * Determines where to put the new items in the data array.
   *
   * @default "end"
   */
  appendItemsTo?: AppendItemsLocation;

  /**
   * Determines if the response should get reversed before appending to the data array.
   *
   * @default false
   */
  reverseResponse?: boolean;

  /**
   * The args that will be merged with the page arg.
   */
  defaultArgs?: Arguments;

  /**
   * The property in the response that contains the total page count.
   *
   * @default "totalPages"
   */
  totalPagesExtractor?: (response: QueryResponse) => number;

  /**
   * The property in the response that contains the count of items per page.
   *
   * @default "itemsPerPage"
   */
  itemsPerPageExtractor?: (response: QueryResponse) => number;

  /**
   * A function that calculates the page value for the next request.
   * E.g. if the pagination is done with a `skip` param, the `pageParamName` should be `skip` and this function should return the correct value.
   */
  pageParamCalculator?: (data: PageParamCalculatorOptions) => number;
}

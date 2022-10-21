import { BehaviorSubject, Subscription } from 'rxjs';
import { filterSuccess, QueryStateData, takeUntilResponse } from '../query';
import {
  AnyQueryCreator,
  QueryCreatorArgs,
  QueryCreatorReturnType,
} from '../query-client';

type PageParamLocation = 'path' | 'query' | 'body' | 'header' | 'variable';

interface InfiniteScrollQueryConfig<
  QueryCreator extends AnyQueryCreator,
  Query extends QueryCreatorReturnType<QueryCreator>,
  Response extends QueryStateData<Query['state']>
> {
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
  defaultArgs?: QueryCreatorArgs<QueryCreator>;

  /**
   * A function that returns the data array from the response.
   */
  responseArrayExtractor: (response: Response) => unknown[];
}

export class InfiniteScrollQuery<
  QueryCreator extends AnyQueryCreator,
  Query extends QueryCreatorReturnType<QueryCreator>,
  Response extends QueryStateData<Query['state']>,
  Config extends InfiniteScrollQueryConfig<QueryCreator, Query, Response>,
  ResponseData extends ReturnType<Config['responseArrayExtractor']>
> {
  private readonly _currentPage$ = new BehaviorSubject<number | null>(null);
  private readonly _currentQuery$ = new BehaviorSubject<Query | null>(null);
  private readonly _data$ = new BehaviorSubject<ResponseData>(
    [] as ResponseData
  );

  private _subscriptions: Subscription[] = [];

  get currentPage$() {
    return this._currentPage$.asObservable();
  }

  get currentPage() {
    return this._currentPage$.getValue();
  }

  get currentQuery$() {
    return this._currentQuery$.asObservable();
  }

  get currentQuery() {
    return this._currentQuery$.getValue();
  }

  get data$() {
    return this._data$.asObservable();
  }

  get data() {
    return this._data$.getValue();
  }

  constructor(private _query: QueryCreator, private _config: Config) {}

  nextPage() {
    const newPage = (this._currentPage$.value ?? 0) + 1;
    const args = this._prepareArgs(this._config, newPage);

    const query = this._query.prepare(args).execute() as Query;
    this._handleNewQuery(query);

    this._currentPage$.next(newPage);
    this._currentQuery$.next(query);
  }

  reset(newConfig?: Omit<Config, 'responseArrayExtractor'>) {
    this.destroy();

    this._config = { ...this._config, ...(newConfig ?? {}) };

    this._currentPage$.next(null);
    this._currentQuery$.next(null);
    this._data$.next([] as ResponseData);
  }

  destroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    this._subscriptions = [];
  }

  private _handleNewQuery(query: Query) {
    const stateChangesSub = query.state$
      .pipe(takeUntilResponse(), filterSuccess())
      .subscribe({
        next: (state) => {
          const newData = this._config?.responseArrayExtractor(state.response);
          this._data$.next([...this._data$.value, ...newData] as ResponseData);
        },
        complete: () => {
          this._subscriptions = this._subscriptions.filter(
            (sub) => sub !== stateChangesSub
          );
        },
      });

    this._subscriptions.push(stateChangesSub);
  }

  private _prepareArgs(
    config: InfiniteScrollQueryConfig<QueryCreator, Query, Response>,
    page: number
  ) {
    const pageParamLocation = this._getPageParamLocation(
      config?.pageParamLocation
    );

    const pageArgs = {
      [pageParamLocation]: {
        [config?.pageParamName ?? 'page']: page,
      },
    };

    if (!config?.defaultArgs) {
      return pageArgs;
    }

    const defaultArgsAtPageParamLocation =
      config.defaultArgs[pageParamLocation];

    return {
      ...config.defaultArgs,
      [pageParamLocation]: {
        ...(defaultArgsAtPageParamLocation ?? {}),
        ...pageArgs[pageParamLocation],
      },
    };
  }

  private _getPageParamLocation(location: PageParamLocation | undefined) {
    const loc = location ?? 'query';

    switch (loc) {
      case 'path':
        return 'pathParams';
      case 'query':
        return 'queryParams';
      case 'body':
        return 'body';
      case 'header':
        return 'headers';
      case 'variable':
        return 'variables';
      default:
        throw new Error(`Invalid pageParamLocation: ${loc}`);
    }
  }
}

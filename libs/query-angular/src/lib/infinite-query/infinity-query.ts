/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, Subscription } from 'rxjs';
import { filterSuccess, QueryStateData, takeUntilResponse } from '../query';
import {
  AnyQueryCreator,
  QueryCreatorArgs,
  QueryCreatorReturnType,
} from '../query-client';
import { InfinityQueryConfig, PageParamLocation } from './infinity-query.types';

export class InfinityQuery<
  QueryCreator extends AnyQueryCreator,
  Query extends QueryCreatorReturnType<QueryCreator>,
  Args extends QueryCreatorArgs<QueryCreator>,
  QueryResponse extends QueryStateData<Query['state']>,
  InfinityResponse extends unknown[]
> {
  private readonly _currentPage$ = new BehaviorSubject<number | null>(null);
  private readonly _currentCalculatedPage$ = new BehaviorSubject<number | null>(
    null
  );
  private readonly _totalPages$ = new BehaviorSubject<number | null>(null);
  private readonly _itemsPerPage$ = new BehaviorSubject<number | null>(null);
  private readonly _currentQuery$ = new BehaviorSubject<Query | null>(null);
  private readonly _data$ = new BehaviorSubject<InfinityResponse>(
    [] as any as InfinityResponse
  );

  private _subscriptions: Subscription[] = [];

  get currentPage$() {
    return this._currentPage$.asObservable();
  }

  get currentPage() {
    return this._currentPage$.getValue();
  }

  get currentCalculatedPage$() {
    return this._currentCalculatedPage$.asObservable();
  }

  get currentCalculatedPage() {
    return this._currentCalculatedPage$.getValue();
  }

  get totalPages$() {
    return this._totalPages$.asObservable();
  }

  get totalPages() {
    return this._totalPages$.getValue();
  }

  get itemsPerPage$() {
    return this._itemsPerPage$.asObservable();
  }

  get itemsPerPage() {
    return this._itemsPerPage$.getValue();
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

  constructor(
    private _config: InfinityQueryConfig<
      QueryCreator,
      Args,
      QueryResponse,
      InfinityResponse
    >
  ) {}

  nextPage() {
    const newPage = (this._currentPage$.value ?? 0) + 1;
    const calculatedPage =
      this._config?.pageParamCalculator?.({
        page: newPage,
        totalPages: this.totalPages,
        itemsPerPage: this.itemsPerPage,
      }) ?? newPage;

    const args = this._prepareArgs(this._config, calculatedPage);

    const query = this._config.queryCreator.prepare(args).execute() as Query;
    this._handleNewQuery(query);

    this._currentPage$.next(newPage);
    this._currentCalculatedPage$.next(calculatedPage);
    this._currentQuery$.next(query);
  }

  reset(
    newConfig?: Omit<
      InfinityQueryConfig<QueryCreator, Args, QueryResponse, InfinityResponse>,
      'responseArrayExtractor' | 'queryCreator' | 'responseArrayType'
    >
  ) {
    this._destroy();

    this._config = { ...this._config, ...(newConfig ?? {}) };

    this._currentPage$.next(null);
    this._currentCalculatedPage$.next(null);
    this._totalPages$.next(null);
    this._itemsPerPage$.next(null);
    this._currentQuery$.next(null);

    this._data$.next([] as any as InfinityResponse);
  }

  _destroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    this._subscriptions = [];
  }

  private _handleNewQuery(query: Query) {
    const stateChangesSub = query.state$
      .pipe(takeUntilResponse(), filterSuccess())
      .subscribe({
        next: (state) => {
          let newData = this._config?.responseArrayExtractor(state.response);

          if (this._config.reverseResponse) {
            newData = [...newData].reverse() as InfinityResponse;
          }

          if (this._config.appendItemsTo === 'start') {
            newData = [...newData, ...this.data] as InfinityResponse;
          } else {
            newData = [...this.data, ...newData] as InfinityResponse;
          }

          this._data$.next(newData);

          const totalPages =
            this._config.totalPagesExtractor?.(state.response) ??
            state.response?.totalPages ??
            null;

          const itemsPerPage =
            this._config.itemsPerPageExtractor?.(state.response) ??
            newData.length;

          this._totalPages$.next(totalPages);
          this._itemsPerPage$.next(itemsPerPage);
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
    config: InfinityQueryConfig<
      QueryCreator,
      Args,
      QueryResponse,
      InfinityResponse
    >,
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

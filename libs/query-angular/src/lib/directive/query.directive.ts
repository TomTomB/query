import {
  Directive,
  ErrorHandler,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { RequestError } from '@tomtomb/query-core';
import { Subscription, tap } from 'rxjs';
import {
  AnyQuery,
  isQueryStateFailure,
  isQueryStateLoading,
  isQueryStateSuccess,
  QueryState,
  QueryStateData,
} from '../new';

interface QueryContext<Q extends AnyQuery | null> {
  $implicit: Q extends AnyQuery ? QueryStateData<Q['state']> | null : null;
  query: Q extends AnyQuery ? QueryStateData<Q['state']> | null : null;
  loading: boolean;
  error: RequestError<unknown> | null;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[query]',
  standalone: true,
})
export class QueryDirective<Q extends AnyQuery | null>
  implements OnInit, OnDestroy
{
  private _isMainViewCreated = false;
  private _subscription: Subscription | null = null;

  private readonly _viewContext: QueryContext<Q> = {
    $implicit: null as any,
    query: null as any,
    loading: false,
    error: null,
  };

  @Input()
  get query(): Q {
    return this._query;
  }
  set query(v: Q) {
    this._query = v;
    this._subscribeToQuery();
  }
  private _query!: Q;

  @Input('queryCache')
  get cache(): boolean {
    return this._cache;
  }
  set cache(v: boolean) {
    this._cache = v;
  }
  private _cache = false;

  constructor(
    private _mainTemplateRef: TemplateRef<QueryContext<Q>>,
    private _viewContainerRef: ViewContainerRef,
    private _errorHandler: ErrorHandler
  ) {}

  static ngTemplateContextGuard<Q extends AnyQuery | null>(
    dir: QueryDirective<Q>,
    ctx: unknown
  ): ctx is QueryContext<Q> {
    return true;
  }

  ngOnInit(): void {
    this._renderMainView();
    this._subscribeToQuery();
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }

  private _subscribeToQuery(): void {
    this._subscription?.unsubscribe();
    this._subscription = null;

    if (!this.query) {
      return;
    }

    const sub = this.query.state$
      .pipe(tap((state) => this._updateView(state)))
      .subscribe();

    this._subscription = sub;
  }

  private _updateView(state: QueryState) {
    if (isQueryStateLoading(state)) {
      this._viewContext.loading = true;
    } else {
      this._viewContext.loading = false;
    }

    if (isQueryStateSuccess(state)) {
      this._viewContext.query = state.response as any;
      this._viewContext.$implicit = state.response as any;
    } else if (!this.cache) {
      this._viewContext.query = null as any;
      this._viewContext.$implicit = null as any;
    }

    if (isQueryStateFailure(state)) {
      this._viewContext.error = state.error;

      this._errorHandler.handleError(state.error);
    } else {
      this._viewContext.error = null;
    }
  }

  private _renderMainView(): void {
    if (!this._isMainViewCreated) {
      this._isMainViewCreated = true;
      this._viewContainerRef.createEmbeddedView(
        this._mainTemplateRef,
        this._viewContext
      );
    }
  }
}

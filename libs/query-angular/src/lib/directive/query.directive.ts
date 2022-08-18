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
  private isMainViewCreated = false;

  private readonly viewContext: QueryContext<Q> = {
    $implicit: null as any,
    query: null as any,
    loading: false,
    error: null,
  };

  private subscription: Subscription | null = null;

  @Input()
  get query(): Q {
    return this._query;
  }
  set query(v: Q) {
    console.log('set query', v);

    this._query = v;
    this._subscribeToQuery();
  }
  private _query!: Q;

  @Input('queryCache')
  get cache(): boolean {
    return this._cache;
  }
  set cache(v: boolean) {
    console.log('set cache', v);

    this._cache = v;
  }
  private _cache = false;

  constructor(
    private readonly mainTemplateRef: TemplateRef<QueryContext<Q>>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly errorHandler: ErrorHandler
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
    this.subscription?.unsubscribe();
  }

  private _subscribeToQuery(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;

    if (!this.query) {
      return;
    }

    const sub = this.query.state$
      .pipe(tap((state) => this._updateView(state)))
      .subscribe();

    this.subscription = sub;
  }

  private _updateView(state: QueryState) {
    if (isQueryStateLoading(state)) {
      this.viewContext.loading = true;
    } else {
      this.viewContext.loading = false;
    }

    if (isQueryStateSuccess(state)) {
      this.viewContext.query = state.response as any;
      this.viewContext.$implicit = state.response as any;
    } else if (!this.cache) {
      this.viewContext.query = null as any;
      this.viewContext.$implicit = null as any;
    }

    if (isQueryStateFailure(state)) {
      this.viewContext.error = state.error;

      this.errorHandler.handleError(state.error);
    } else {
      this.viewContext.error = null;
    }
  }

  private _renderMainView(): void {
    if (!this.isMainViewCreated) {
      this.isMainViewCreated = true;
      this.viewContainerRef.createEmbeddedView(
        this.mainTemplateRef,
        this.viewContext
      );
    }
  }
}

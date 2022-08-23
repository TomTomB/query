import {
  deepFreeze,
  request,
  buildBody,
  isAbortRequestError,
  isRequestError,
  BaseArguments,
} from '@tomtomb/query-core';
import { Subscription, BehaviorSubject, interval, takeUntil } from 'rxjs';
import { AuthProvider } from '../auth';
import { QueryClient } from '../query-client';
import { QueryClientConfig } from '../query-client/query-client.types';
import {
  QueryState,
  QueryStateType,
  PollConfig,
  QueryStateMeta,
  RouteType,
  QueryConfig,
  RunQueryOptions,
  AnyDynamicArguments,
} from './query.types';
import {
  isQueryStateSuccess,
  isQueryStateLoading,
  mergeHeaders,
} from './query.utils';

export class Query<
  Route extends RouteType<Arguments>,
  Response,
  Arguments extends AnyDynamicArguments | undefined
> {
  private _currentId = 0;
  private _abortController = new AbortController();
  private _pollingSubscription: Subscription | null = null;

  private readonly _state$: BehaviorSubject<QueryState<Response>>;

  private get _nextId() {
    return this._currentId++;
  }

  get state$() {
    return this._state$.asObservable();
  }

  get state() {
    return this._state$.value;
  }

  get isExpired() {
    if (!isQueryStateSuccess(this.state)) {
      return false;
    }

    const ts = this.state.meta.expiresAt;

    if (!ts) {
      return true;
    }

    return ts < Date.now();
  }

  constructor(
    private _client: QueryClient,
    private _queryConfig: QueryConfig<Route, Response, Arguments>,
    private _route: Route,
    private _args: Arguments | undefined
  ) {
    this._state$ = new BehaviorSubject<QueryState<Response>>({
      type: QueryStateType.Prepared,
      meta: { id: this._currentId },
    });
  }

  execute(options?: RunQueryOptions) {
    if (
      !this.isExpired &&
      !options?.skipCache &&
      isQueryStateSuccess(this.state)
    ) {
      return this;
    }

    if (this._queryConfig.secure && !this._client.authProvider) {
      throw new Error('Cannot execute secure query without auth provider');
    }

    const id = this._nextId;

    if (isQueryStateLoading(this._state$.value)) {
      this.abort();
    }

    const meta = deepFreeze({ id });

    this._state$.next({
      type: QueryStateType.Loading,
      meta,
    });

    request<Response>({
      route: this._route,
      init: {
        method: this._queryConfig.method,
        signal: this._abortController.signal,
        body: buildBody((this._args as BaseArguments)?.body),
        headers: mergeHeaders(
          this._client.authProvider?.header,
          this._args?.headers
        ),
      },
      cacheAdapter: this._client.config.request?.cacheAdapter,
    })
      .then((response) => {
        const isResponseObject = typeof response === 'object';

        this._state$.next({
          type: QueryStateType.Success,
          response: (isResponseObject
            ? deepFreeze(response.data as Record<string, unknown>)
            : response) as Response,
          meta: deepFreeze({ ...meta, expiresAt: response.expiresInTimestamp }),
        });
      })
      .catch((error) => this._handleExecuteError(error, meta));

    return this;
  }

  abort() {
    this._abortController.abort();
    this._abortController = new AbortController();

    return this;
  }

  poll(config: PollConfig) {
    if (this._pollingSubscription) {
      return this;
    }

    this._pollingSubscription = interval(config.interval)
      .pipe(takeUntil(config.takeUntil))
      .subscribe(() => this.execute({ skipCache: true }));

    return this;
  }

  stopPolling() {
    this._pollingSubscription?.unsubscribe();
    this._pollingSubscription = null;

    return this;
  }

  private _handleExecuteError(error: unknown, meta: QueryStateMeta) {
    if (isAbortRequestError(error)) {
      this._state$.next({
        type: QueryStateType.Cancelled,
        meta,
      });
    } else if (isRequestError(error)) {
      this._state$.next({
        type: QueryStateType.Failure,
        error,
        meta,
      });
    } else {
      throw error;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, filter, Observable, takeWhile, tap } from 'rxjs';
import { LetDirective } from './ngrx/let.directive';

@Component({
  selector: 'tomtomb-name',
  template: `
    <ng-container
      *ngrxLet="query$ as response; loading as loading; error as error"
    ></ng-container>
  `,
  standalone: true,
  imports: [LetDirective],
})
export class NameComponent implements OnInit {
  query$ = new BehaviorSubject<{ foo: string }>({ foo: 'gfffsdf' });

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const query: ExecutedQuery = getFoo.execute();

    query.state$
      .pipe(
        takeUntilResponse(),
        onlySuccessful(),
        tap((data) => console.log(data))
      )
      .subscribe();
  }
}

interface SuccessResponse {
  type: 'SUCCESS';
  response: Response;
}
interface FailureResponse {
  type: 'ERROR';
  response: ErrorResponse;
}
interface LoadingResponse {
  type: 'LOADING';
}
interface CancelResponse {
  type: 'CANCELLED';
}

type QueryState =
  | LoadingResponse
  | SuccessResponse
  | FailureResponse
  | CancelResponse;

interface ExecutedQuery {
  state$: Observable<QueryState>;

  // For later
  abort(): void;
  refresh(): void;
}

type Response = { foo: string };
type ErrorResponse = { foo: string };

function onlySuccessful() {
  return function <T extends QueryState>(source: Observable<T>) {
    return source.pipe(
      filter((value) => value.type === 'SUCCESS')
    ) as Observable<SuccessResponse>;
  };
}

function takeUntilResponse() {
  return function <T extends QueryState>(source: Observable<T>) {
    return source.pipe(takeWhile((value) => value.type === 'LOADING', true));
  };
}

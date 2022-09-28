import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  QueryClient,
  filterSuccess,
  takeUntilResponse,
  filterFailure,
  QueryType,
  QueryCreator,
  BaseArguments,
} from '@tomtomb/query-angular';
import { def } from '@tomtomb/query-core';
import { Subject, tap } from 'rxjs';
import { Post } from './types';

const client = new QueryClient({
  baseRoute: 'https://jsonplaceholder.typicode.com',
});

// const authProvider = new BearerAuthProvider({
//   token:
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYzMzkwMjJ9.KoPc-onJu1GGMz7IY8aZwz7PQyro500DKeKB7gSlPNw',
//   refreshConfig: {
//     method: 'POST',
//     route: '/auth/refresh-token',
//     token: 'refreshToken',
//   },
// });

// client.setAuthProvider(authProvider);

const getPost = client.get({
  route: (p) => `/posts/${p.id}`,
  // secure: true,
  types: {
    args: def<{ pathParams: { id: number } }>(),
    response: def<Post>(),
  },
});

export type QueryType2<T extends QueryCreator<any, any, any, any>> =
  T['prepare'] extends () => infer R
    ? R
    : T['prepare'] extends (args: any) => infer R
    ? R
    : never;

type InferReturnTypeFromQuery<
  T extends QueryCreator<BaseArguments | undefined, any, any, any>
> = ReturnType<T['prepare']>;

type Foo = InferReturnTypeFromQuery<typeof getPost>;

type X = ReturnType<typeof getPost['prepare']>;

const x = getPost.prepare({ pathParams: { id: 1 } }).execute();
const clone = x.clone();
const y = clone.prepare({ pathParams: { id: 2 } }).execute();

@Component({
  selector: 'tomtomb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  getPosts!: QueryType2<typeof getPost>;
  getPosts$ = getPost.behaviorSubject();

  private _destroy$ = new Subject();

  ngOnInit(): void {
    const query = getPost
      ?.prepare({
        pathParams: { id: 1 },
      })
      .execute();
    // .poll({ interval: 10000, takeUntil: this._destroy$ });

    this.getPosts = query;
    this.getPosts$.next(query);

    setTimeout(() => {
      const query2 = getPost
        .prepare({
          pathParams: { id: 4 },
        })
        .execute();
      // .poll({ interval: 10000, takeUntil: this._destroy$ });

      this.getPosts$.next(query2);
    }, 2500);

    query.state$
      .pipe(
        takeUntilResponse(),
        filterSuccess(),
        tap((data) => console.log(data.response))
      )
      .subscribe();

    query.state$
      .pipe(
        takeUntilResponse(),
        filterFailure(),
        tap((data) => console.log(data.error))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.unsubscribe();
  }
}

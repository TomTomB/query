/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  QueryClient,
  filterSuccess,
  takeUntilResponse,
  filterFailure,
  QueryType,
  createReactiveQuery,
  CustomHeaderAuthProvider,
  gql,
} from '@tomtomb/query-angular';
import { def } from '@tomtomb/query-core';
import { Subject, takeUntil, tap } from 'rxjs';
import { Post } from './types';

const restClient = new QueryClient({
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

const getPost = restClient.get({
  route: (p) => `/posts/${p.id}`,
  // secure: true,
  types: {
    args: def<{ pathParams: { id: number } }>(),
    response: def<Post>(),
  },
});

// const getPosts = client.get({
//   route: '/posts',
//   // secure: true,
//   types: {
//     response: def<Post[]>(),
//   },
// });

// const x = getPost.prepare({ pathParams: { id: 1 } }).execute();
// const clone = x.clone();
// const y = clone.prepare({ pathParams: { id: 2 } }).execute();

// const shouldError = clone.prepare().execute();
// const shouldWork = getPosts.prepare().execute();

const gqlClient = new QueryClient({
  baseRoute: 'https://api.spacex.land/graphql',
});

const QUERY = gql`
  query ExampleQuery {
    roadster {
      apoapsis_au
    }
    capsules {
      dragon {
        active
      }
    }
  }
`;

const getLaunches = gqlClient.gqlQuery({
  query: QUERY,
  // types: {
  //   response: def<any>(),
  //   args: def<{ variables: { limit: number } }>(),
  // },
});

getLaunches.prepare().execute();

@Component({
  selector: 'tomtomb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  getPosts!: QueryType<typeof getPost>;
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
      const query2 = query
        .clone()
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

    const { form, changes } = createReactiveQuery({
      query: getPost,
      fields: {
        id: {
          control: new FormControl<number>(1),
          isPathParam: true,
          debounce: 3000,
        },
      },
    });

    changes.pipe(takeUntil(this._destroy$)).subscribe((preparedQuery) => {
      this.getPosts$.next(preparedQuery.execute());
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.unsubscribe();
  }
}

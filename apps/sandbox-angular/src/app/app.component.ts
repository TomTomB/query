/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  QueryClient,
  filterSuccess,
  takeUntilResponse,
  filterFailure,
  QueryType,
  createReactiveQuery,
  gql,
  ReactiveQueryFieldsOf,
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

// const q = createReactiveQuery({ query: getLaunches, fields: { limit: { control: new FormControl(10),type: 'variable'  } }  })

// q.changes.subscribe(params => {

//   getLaunches.prepare({ ...params }).execute().subscribe(console.log)

// })

getLaunches.prepare().execute().state$.subscribe(console.log);

@Component({
  selector: 'tomtomb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  getPosts!: QueryType<typeof getPost>;
  getPosts$ = getPost.behaviorSubject();

  private _destroy$ = new Subject();

  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

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

    const fields: ReactiveQueryFieldsOf<typeof getPost> = {
      pathParams: {
        id: {
          control: new FormControl<number>(1),
          debounce: 3000,
        },
      },
    };

    // This set timeout is needed since the activated route is not yet initialized.
    // This is a hack and only needed for the sandbox app.
    setTimeout(() => {
      const { form, changes } = createReactiveQuery({
        query: getPost,
        fields,
        activatedRoute: this._activatedRoute,
        router: this._router,
      });

      changes.pipe(takeUntil(this._destroy$)).subscribe((args) => {
        this.getPosts$.next(
          getPost
            .prepare({ pathParams: { id: args.pathParams.id ?? 1 } })
            .execute()
        );
      });

      setTimeout(() => {
        form.controls.pathParams.controls.id.setValue(21);
      }, 2500);
    }, 500);
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.unsubscribe();
  }
}

import { Component, OnInit } from '@angular/core';
import {
  QueryClient,
  filterSuccess,
  takeUntilResponse,
  filterFailure,
  QueryType,
} from '@tomtomb/query-angular';
import { def } from '@tomtomb/query-core';
import { Subject, tap } from 'rxjs';
import { Post } from './types';

const client = new QueryClient({
  baseRoute: 'https://jsonplaceholder.typicode.com',
});

const getPost = client.get({
  route: (p) => `/posts/${p.id}`,
  types: {
    args: def<{ pathParams: { id: number } }>(),
    response: def<Post>(),
  },
});

const getPosts = client.get({
  route: '/posts',
  types: {
    response: def<Post>(),
  },
});

@Component({
  selector: 'tomtomb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  getPosts!: QueryType<typeof getPost>;

  getPosts$ = getPost.behaviorSubject();

  ngOnInit(): void {
    const _destroy$ = new Subject();

    const query = getPost
      ?.prepare({
        pathParams: { id: 1 },
      })
      .execute();
    // .poll({ interval: 10000, takeUntil: _destroy$ });

    this.getPosts = query;
    this.getPosts$.next(query);

    getPosts.prepare({});

    setTimeout(() => {
      const query2 = getPost
        .prepare({
          pathParams: { id: 4 },
        })
        .execute();
      // .poll({ interval: 10000, takeUntil: _destroy$ });

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
}

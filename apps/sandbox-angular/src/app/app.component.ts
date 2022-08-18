import { Component, OnInit } from '@angular/core';
import {
  QueryClient,
  filterSuccess,
  takeUntilResponse,
  Success,
  isQueryStateSuccess,
  filterFailure,
} from '@tomtomb/query-angular';
import { RunQueryOptions, RequestError, def } from '@tomtomb/query-core';
import { combineLatest, filter, Subject, tap } from 'rxjs';
import { getPost } from './query';
import { Post } from './types';

@Component({
  selector: 'tomtomb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'sandbox-angular';

  post?: Post;
  postError?: RequestError;

  ngOnInit(): void {
    // this.executeGetPost(1);
    // this.executeGetPost(1, { abortPrevious: true });
    // this.executeGetPost(2);

    // setTimeout(() => {
    //   this.executeGetPost(2);
    // }, 20000);

    const client = new QueryClient({
      baseRoute: 'https://jsonplaceholder.typicode.com',
      logging: {
        queryStateChanges: true,
        queryStateGarbageCollector: true,
      },
      request: {
        cacheAdapter: () => 10,
      },
    });

    const getPosts = client.get({
      route: '/posts',
      types: {
        args: def<{ queryParams: { foo: number } }>(),
        response: def<Post[]>(),
      },
    });

    const query = getPosts
      .prepare(
        {
          queryParams: { foo: 0 },
        },
        { skipCache: true }
      )
      .execute();

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

    // const getPosts2 = client.createQuery({
    //   route: '/posts',
    //   method: 'POST',
    // });

    // const query2 = getPosts2.execute({
    //   queryParams: { foo: 0 },
    // });

    // query2.state$
    //   .pipe(
    //     tap((d) => {
    //       console.warn('Data 2');
    //       console.log(d);
    //     })
    //   )
    //   .subscribe({ complete: () => console.warn('Complete') });

    // setTimeout(() => {
    //   query.execute();
    //   const unsubscribe = query.poll({
    //     interval: 1000,
    //     takeUntil: new Subject(),
    //   });
    //   setTimeout(() => {
    //     unsubscribe();
    //     console.log('unsubscribed');
    //   }, 5000);
    // }, 2500);
  }

  executeGetPost(id: number, options?: RunQueryOptions) {
    getPost
      .execute({ pathParams: { id } }, options)
      .then((p) => (this.post = p))
      .catch((e: RequestError) => (this.postError = e));

    // from(getPost.execute({ pathParams: { id } }, options))
    //   .pipe(tap((p) => (this.post = p)))
    //   .subscribe();
  }
}

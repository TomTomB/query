import { Component, OnInit } from '@angular/core';
import { RunQueryOptions, RequestError } from '@tomtomb/query-core';
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
    this.executeGetPost(1);
    this.executeGetPost(1, { abortPrevious: true });
    this.executeGetPost(2);

    setTimeout(() => {
      this.executeGetPost(2);
    }, 20000);
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

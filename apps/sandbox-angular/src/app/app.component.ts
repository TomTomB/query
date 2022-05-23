import { Component, OnInit } from '@angular/core';
import { ExecuteOptions, RequestError } from '@tomtomb/query-core';
import { from, tap } from 'rxjs';
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

  executeGetPost(id: number, options?: ExecuteOptions) {
    getPost({ pathParams: { id } }, options)
      .then((p) => (this.post = p))
      .catch((e: RequestError) => (this.postError = e));

    // from(getPost({ pathParams: { id } }, options))
    //   .pipe(tap((p) => (this.post = p)))
    //   .subscribe();
  }
}
